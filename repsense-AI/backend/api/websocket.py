"""
websocket.py
------------
WebSocket optimization tips:
1. Frame queue maxsize=2 — agar queue full ho to naya frame drop karo (lag prevention)
2. Processing alag thread mein — receive/send block nahi hota
3. Adaptive JPEG quality — FPS drop pe quality kam karo
4. Binary frames prefer karo base64 ke bajaye — 33% smaller
"""

from fastapi import WebSocket, WebSocketDisconnect
import asyncio, cv2, numpy as np, base64, json, time, threading, queue

from core.pose_detector   import PoseDetector
from core.angle_calculator import AngleCalculator
from core.rep_counter      import RepCounter
from core.form_checker     import FormChecker
from ai.gemini_feedback    import GeminiFeedback
from ai.voice_feedback     import VoiceFeedback


class Session:
    def __init__(self, ws):
        self.ws          = ws
        self.exercise    = 'Squat'
        self.lang        = 'en'
        self.active      = False

        self.detector    = PoseDetector(use_yolo=True)
        self.angles      = AngleCalculator()
        self.counter     = RepCounter('Squat')
        self.form        = FormChecker()
        self.gemini      = GeminiFeedback()
        self.voice       = VoiceFeedback()

        # maxsize=2: prevents lag buildup — older frames dropped automatically
        self.frames      = queue.Queue(maxsize=2)
        self.results     = queue.Queue(maxsize=4)

        self.t_start     = time.time()
        self.t_last_fb   = 0

        threading.Thread(target=self._loop, daemon=True).start()

    def _loop(self):
        while self.active:
            try:
                raw = self.frames.get(timeout=0.08)
                result = self._process(raw)
                if not self.results.full():
                    self.results.put(result)
                else:
                    try: self.results.get_nowait()
                    except: pass
                    self.results.put(result)
            except queue.Empty:
                continue
            except Exception as e:
                print(f"[Session._loop] {e}")

    def _decode(self, data):
        try:
            if isinstance(data, str):
                if ',' in data: data = data.split(',')[1]
                data = base64.b64decode(data)
            arr = np.frombuffer(data, np.uint8)
            return cv2.imdecode(arr, cv2.IMREAD_COLOR)
        except:
            return None

    def _process(self, raw):
        t0 = time.time()
        frame = self._decode(raw)
        if frame is None:
            return None

        annotated, kp, fps = self.detector.process_frame(frame)
        A = self.angles.all_angles(kp)
        rep_info = self.counter.update(A)
        fbs, score = self.form.check(self.exercise, A, rep_info['phase'], rep_info['count'])

        # Which issue to report
        issue = next((f.joint for f in fbs if f.severity == 'error'), None) or \
                next((f.joint for f in fbs if f.severity == 'warning'), None)

        # AI feedback triggers
        now = time.time()
        rep      = rep_info['rep']
        milestone = rep and rep_info['count'] % 5 == 0
        ai_msg   = None

        if rep or milestone or (issue and now - self.t_last_fb > 5):
            ctx = {
                'exercise': self.exercise, 'reps': rep_info['count'],
                'phase': rep_info['phase'], 'score': score,
                'issue': issue, 'rep_time': 2.0, 'is_milestone': milestone,
            }
            ai_msg = self.gemini.get(ctx, self.lang)
            self.t_last_fb = now
            if ai_msg:
                self.voice.speak(ai_msg)

        # Encode annotated frame — adaptive quality
        q = 85 if fps > 25 else (70 if fps > 15 else 55)
        _, buf = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, q])
        frame_b64 = base64.b64encode(buf).decode()

        return {
            'frame':    frame_b64,
            'angles':   {k: round(v,1) for k,v in A.items()},
            'reps':     rep_info['count'],
            'phase':    rep_info['phase'],
            'state':    rep_info['state'],
            'score':    score,
            'feedback': [{'sev': f.severity,
                          'msg': f.ur if self.lang=='ur' else f.en,
                          'joint': f.joint} for f in fbs],
            'ai_msg':   ai_msg,
            'rep':      rep,
            'milestone':milestone,
            'is_fast':  rep_info['is_fast'],
            'fps':      round(fps, 1),
            'ms':       round((time.time()-t0)*1000, 1),
        }

    def set_exercise(self, ex):
        self.exercise = ex
        self.counter  = RepCounter(ex)
        self.angles.reset()

    def cleanup(self):
        self.active = False
        self.detector.release()


async def ws_handler(websocket: WebSocket):
    await websocket.accept()
    sess = Session(websocket)
    sess.active = True

    try:
        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_json(), timeout=25)
            except asyncio.TimeoutError:
                await websocket.send_json({'type':'ping'})
                continue

            t = msg.get('type','frame')

            if t == 'config':
                if 'exercise' in msg: sess.set_exercise(msg['exercise'])
                if 'language' in msg:
                    sess.lang = msg['language']
                    sess.voice.set_lang(msg['language'])
                await websocket.send_json({'type':'ack','exercise':sess.exercise})

            elif t == 'ping':
                await websocket.send_json({'type':'pong'})

            elif t == 'frame':
                data = msg.get('data')
                if data:
                    try: sess.frames.put_nowait(data)
                    except queue.Full: pass
                try:
                    r = sess.results.get_nowait()
                    if r: await websocket.send_json({**r, 'type':'result'})
                except queue.Empty: pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[WS] {e}")
    finally:
        sess.cleanup()
