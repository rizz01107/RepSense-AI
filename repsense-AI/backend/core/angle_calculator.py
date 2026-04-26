"""
angle_calculator.py
-------------------
Problem: Ek frame mein knee 85°, agley mein 115°.
Body itni fast nahi hilti — yeh noise hai.

Fix: EMA (Exponential Moving Average) + outlier rejection (40°+ jump = skip)
arctan2 use kiya arccos ki jagah — numerically stable hai values 1.0 ke paas.
"""

import numpy as np
from collections import defaultdict, deque


def raw_angle(a, b, c):
    """Teen 2D points se angle at point b."""
    a, b, c = np.array(a, float), np.array(b, float), np.array(c, float)
    ba, bc = a - b, c - b
    angle = np.degrees(np.arctan2(np.cross(ba, bc), np.dot(ba, bc)))
    return abs(angle)


class AngleCalculator:
    def __init__(self, window=5, alpha=0.32):
        self.alpha = alpha          # EMA factor — 0.3 balanced hai
        self.ema = {}               # Current EMA per joint
        self.history = defaultdict(lambda: deque(maxlen=window))

    def _ema(self, key, val):
        if key not in self.ema:
            self.ema[key] = val
            return val
        # Outlier rejection — 40°+ jump in one frame physically impossible
        if abs(val - self.ema[key]) > 40:
            return self.ema[key]
        self.ema[key] = self.alpha * val + (1 - self.alpha) * self.ema[key]
        return round(self.ema[key], 1)

    def angle(self, key, a, b, c, vis_thresh=0.45):
        """Smoothed angle with visibility check."""
        vmin = min(a.get('visibility',1), b.get('visibility',1), c.get('visibility',1))
        if vmin < vis_thresh:
            return self.ema.get(key)  # Last known value
        val = raw_angle([a['x'],a['y']], [b['x'],b['y']], [c['x'],c['y']])
        return self._ema(key, val)

    def all_angles(self, kp):
        """All joints ek call mein."""
        if not kp:
            return {}
        A = {}
        has = lambda n: n in kp

        # Knee angles
        if has('left_hip') and has('left_knee') and has('left_ankle'):
            A['left_knee'] = self.angle('left_knee', kp['left_hip'], kp['left_knee'], kp['left_ankle'])
        if has('right_hip') and has('right_knee') and has('right_ankle'):
            A['right_knee'] = self.angle('right_knee', kp['right_hip'], kp['right_knee'], kp['right_ankle'])
        if A.get('left_knee') and A.get('right_knee'):
            A['knee'] = (A['left_knee'] + A['right_knee']) / 2
        elif A.get('left_knee'):
            A['knee'] = A['left_knee']
        elif A.get('right_knee'):
            A['knee'] = A['right_knee']

        # Hip angles
        if has('left_shoulder') and has('left_hip') and has('left_knee'):
            A['left_hip'] = self.angle('left_hip', kp['left_shoulder'], kp['left_hip'], kp['left_knee'])
        if has('right_shoulder') and has('right_hip') and has('right_knee'):
            A['right_hip'] = self.angle('right_hip', kp['right_shoulder'], kp['right_hip'], kp['right_knee'])
        if A.get('left_hip') and A.get('right_hip'):
            A['hip'] = (A['left_hip'] + A['right_hip']) / 2

        # Elbow angles
        if has('left_shoulder') and has('left_elbow') and has('left_wrist'):
            A['left_elbow'] = self.angle('left_elbow', kp['left_shoulder'], kp['left_elbow'], kp['left_wrist'])
        if has('right_shoulder') and has('right_elbow') and has('right_wrist'):
            A['right_elbow'] = self.angle('right_elbow', kp['right_shoulder'], kp['right_elbow'], kp['right_wrist'])
        if A.get('left_elbow') and A.get('right_elbow'):
            A['elbow'] = (A['left_elbow'] + A['right_elbow']) / 2

        # Back angle — shoulder midpoint se hip midpoint
        if all(has(n) for n in ['left_shoulder','right_shoulder','left_hip','right_hip']):
            sm = {'x': (kp['left_shoulder']['x']+kp['right_shoulder']['x'])/2,
                  'y': (kp['left_shoulder']['y']+kp['right_shoulder']['y'])/2,
                  'visibility': min(kp['left_shoulder']['visibility'], kp['right_shoulder']['visibility'])}
            hm = {'x': (kp['left_hip']['x']+kp['right_hip']['x'])/2,
                  'y': (kp['left_hip']['y']+kp['right_hip']['y'])/2,
                  'visibility': min(kp['left_hip']['visibility'], kp['right_hip']['visibility'])}
            vref = {'x': sm['x'], 'y': sm['y']-100, 'visibility': 1.0}
            A['back'] = self.angle('back', vref, sm, hm)

        # Shoulder angles
        if has('left_elbow') and has('left_shoulder') and has('left_hip'):
            A['left_shoulder_angle'] = self.angle('lsh', kp['left_elbow'], kp['left_shoulder'], kp['left_hip'])

        return {k: v for k, v in A.items() if v is not None}

    def reset(self):
        self.ema.clear()
        self.history.clear()
