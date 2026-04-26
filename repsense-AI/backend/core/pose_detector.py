"""
pose_detector.py (REPSENSE AI - FIXED & OPTIMIZED)
-----------------------------------------------
Hybrid: MediaPipe + YOLO (Torch 2.4 Stable)
"""

import cv2
import numpy as np
import mediapipe as mp
import time
import threading
from collections import deque

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except Exception:
    YOLO_AVAILABLE = False

# -----------------------------
# Kalman Filter (Smoothing)
# -----------------------------
class KalmanFilter1D:
    def __init__(self, q=0.01, r=0.1):
        self.q = q  
        self.r = r  
        self.p = 1.0
        self.x = None

    def update(self, z):
        if self.x is None:
            self.x = z
            return z
        self.p += self.q
        k = self.p / (self.p + self.r)
        self.x += k * (z - self.x)
        self.p *= (1 - k)
        return self.x

# -----------------------------
# Pose Detector Engine
# -----------------------------
class PoseDetector:

    LANDMARKS = {
        'nose': 0,
        'left_shoulder': 11, 'right_shoulder': 12,
        'left_elbow': 13, 'right_elbow': 14,
        'left_wrist': 15, 'right_wrist': 16,
        'left_hip': 23, 'right_hip': 24,
        'left_knee': 25, 'right_knee': 26,
        'left_ankle': 27, 'right_ankle': 28,
    }

    def __init__(self, use_yolo=True, model_path="models/yolov8n-pose.pt"):

        # ---------------- MediaPipe Backend ----------------
        self.mp_pose = mp.solutions.pose
        # FIX: Confidence ko 0.3 kiya takay low light/fast motion detect ho sake
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.3,
            min_tracking_confidence=0.3
        )

        # ---------------- YOLO Backend ----------------
        self.yolo = None
        self.yolo_kps = None
        self.yolo_lock = threading.Lock()
        self.yolo_interval = 3 
        self.frame_count = 0

        if use_yolo and YOLO_AVAILABLE:
            self._load_yolo(model_path)

        # ---------------- Smoothing & Metrics ----------------
        self.kalmans = {name: {'x': KalmanFilter1D(), 'y': KalmanFilter1D()} for name in self.LANDMARKS}
        self.fps_q = deque(maxlen=30)
        self.t_last = time.time()

    def _load_yolo(self, path):
        try:
            self.yolo = YOLO(path)
            print("[PoseDetector] YOLO loaded ✅")
        except Exception as e:
            print(f"[PoseDetector] YOLO load error: {e}")

    def _smooth_kp(self, kp):
        if kp is None: return None
        smoothed = {}
        for name, coords in kp.items():
            s_x = self.kalmans[name]['x'].update(coords['x'])
            s_y = self.kalmans[name]['y'].update(coords['y'])
            smoothed[name] = { **coords, "x": s_x, "y": s_y }
        return smoothed

    def _run_yolo_async(self, frame):
        if self.yolo is None: return
        def run():
            try:
                results = self.yolo(frame, verbose=False, conf=0.4)
                if results and results[0].keypoints is not None:
                    kpts = results[0].keypoints.xy[0].cpu().numpy()
                    if len(kpts) > 0:
                        with self.yolo_lock:
                            self.yolo_kps = kpts
            except Exception: pass
        threading.Thread(target=run, daemon=True).start()

    def process_frame(self, frame):
        self.frame_count += 1
        h, w = frame.shape[:2]

        # Convert to RGB for MediaPipe
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = self.pose.process(rgb)

        kp = None
        if res.pose_landmarks:
            kp = {}
            for name, idx in self.LANDMARKS.items():
                lm = res.pose_landmarks.landmark[idx]
                # FIX: Visibility 0.5 se 0.2 ki takay dhundli kohni bhi detect ho
                if lm.visibility > 0.2:
                    kp[name] = {
                        "x": lm.x * w,
                        "y": lm.y * h,
                        "z": lm.z,
                        "visibility": float(lm.visibility)
                    }

        # Background YOLO logic
        if self.yolo and self.frame_count % self.yolo_interval == 0:
            small_yolo = cv2.resize(frame, (640, 480))
            self._run_yolo_async(small_yolo)

        # Apply Smoothing
        kp = self._smooth_kp(kp)

        # Visuals
        annotated = frame.copy()
        if kp:
            self._draw(annotated, kp)
            
            # Draw a simple box around user for visual feedback
            all_x = [pt["x"] for pt in kp.values()]
            all_y = [pt["y"] for pt in kp.values()]
            if all_x:
                cv2.rectangle(annotated, (int(min(all_x)-30), int(min(all_y)-30)), 
                              (int(max(all_x)+30), int(max(all_y)+30)), (0, 255, 0), 2)
                cv2.putText(annotated, "USER DETECTED", (int(min(all_x)), int(min(all_y)-40)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # FPS Calculation
        now = time.time()
        fps = 1.0 / max(now - self.t_last, 1e-6)
        self.t_last = now
        self.fps_q.append(fps)
        avg_fps = float(np.mean(self.fps_q))

        return annotated, kp, avg_fps

    def _draw(self, frame, kp):
        connections = [
            ('left_shoulder','right_shoulder'), ('left_shoulder','left_elbow'),
            ('left_elbow','left_wrist'), ('right_shoulder','right_elbow'),
            ('right_elbow','right_wrist'), ('left_shoulder','left_hip'),
            ('right_shoulder','right_hip'), ('left_hip','right_hip'),
            ('left_hip','left_knee'), ('left_knee','left_ankle'),
            ('right_hip','right_knee'), ('right_knee','right_ankle'),
        ]

        for a, b in connections:
            if a in kp and b in kp:
                cv2.line(frame, (int(kp[a]["x"]), int(kp[a]["y"])),
                         (int(kp[b]["x"]), int(kp[b]["y"])), (0, 255, 200), 3)

        for _, pt in kp.items():
            cv2.circle(frame, (int(pt["x"]), int(pt["y"])), 6, (0, 255, 0), -1)

    def release(self):
        self.pose.close()