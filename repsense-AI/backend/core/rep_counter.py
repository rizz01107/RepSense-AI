"""
rep_counter.py
--------------
Naive threshold: knee < 90 → rep++  → False positives bahut hote hain
(banda squat bottom pe thoda rock karta hai → 5 reps count hote hain 1 ki jagah)

Fix: State machine — READY → DOWN → BOTTOM → UP → COUNT
Rep sirf tab count hoga jab puri cycle complete ho.
Plus debounce: min 0.8 sec per rep.
"""

import time
from collections import deque


THRESHOLDS = {
    'Squat':          {'key':'knee',         'dn':115, 'up':155, 'at':'bottom'},
    'Push-up':        {'key':'elbow',        'dn':110, 'up':155, 'at':'bottom'},
    'Deadlift':       {'key':'hip',          'dn':110, 'up':160, 'at':'top'},
    'Bicep Curl':     {'key':'elbow',        'dn':130, 'up':55,  'at':'top'},
    'Lunge':          {'key':'left_knee',    'dn':115, 'up':155, 'at':'bottom'},
    'Plank':          {'key':'back',         'dn':None,'up':None,'at':'time'},
    'Shoulder Press': {'key':'elbow',        'dn':100, 'up':155, 'at':'top'},
    'Jumping Jack':   {'key':'left_shoulder_angle','dn':80,'up':140,'at':'top'},
    'Mountain Climber':{'key':'left_knee',  'dn':100, 'up':155, 'at':'bottom'},
    'Burpee':         {'key':'knee',         'dn':115, 'up':160, 'at':'top'},
}


class RepCounter:
    def __init__(self, exercise='Squat'):
        self.exercise = exercise
        self.count = 0
        self.state = 'READY'      # READY / GOING_DOWN / BOTTOM / GOING_UP
        self.phase = 'up'
        self.t_last_rep = 0
        self.t_phase = time.time()
        self.min_rep_sec = 0.75
        self.angle_q = deque(maxlen=8)
        self.t_q = deque(maxlen=8)
        self.rep_durations = []

    def _velocity(self):
        """degrees/sec — zyada fast = bad form warning"""
        if len(self.angle_q) < 3:
            return 0
        angs = list(self.angle_q)[-3:]
        ts   = list(self.t_q)[-3:]
        dt   = ts[-1] - ts[0]
        return abs(angs[-1] - angs[0]) / dt if dt > 0.001 else 0

    def update(self, angles: dict) -> dict:
        thr = THRESHOLDS.get(self.exercise, THRESHOLDS['Squat'])
        key = thr['key']
        val = angles.get(key)
        now = time.time()

        if val is None:
            return self._out(False)

        self.angle_q.append(val)
        self.t_q.append(now)
        vel = self._velocity()

        rep = False

        if thr['at'] == 'time':
            # Plank — time se measure karo
            return self._out(False, val, vel)

        dn, up, at = thr['dn'], thr['up'], thr['at']

        if self.state == 'READY':
            if dn and val < dn:
                self.state = 'GOING_DOWN'
                self.phase = 'down'
                self.t_phase = now

        elif self.state == 'GOING_DOWN':
            if dn and val < dn - 12:
                self.state = 'BOTTOM'
                if at == 'bottom':
                    rep = self._count(now, vel)
            elif val > dn:
                self.state = 'READY'

        elif self.state == 'BOTTOM':
            if val > dn:
                self.state = 'GOING_UP'
                self.phase = 'up'

        elif self.state == 'GOING_UP':
            if up and val > up:
                self.state = 'READY'
                if at == 'top':
                    rep = self._count(now, vel)
            elif dn and val < dn:
                self.state = 'GOING_DOWN'
                self.phase = 'down'

        return self._out(rep, val, vel)

    def _count(self, now, vel):
        if now - self.t_last_rep < self.min_rep_sec:
            return False
        if vel > 480:   # Too fast — probably noise
            return False
        self.count += 1
        self.t_last_rep = now
        return True

    def _out(self, rep, angle=None, vel=0):
        return {
            'rep': rep, 'count': self.count,
            'state': self.state, 'phase': self.phase,
            'angle': angle, 'velocity': round(vel, 1),
            'is_fast': vel > 280,
        }

    def reset(self):
        self.count = 0
        self.state = 'READY'
        self.phase = 'up'
        self.t_last_rep = 0
        self.angle_q.clear()
        self.t_q.clear()
