"""
form_checker.py
---------------
Context-aware form checking.
Squat down phase mein back lean acceptable hai,
lekin bottom pe round back = injury risk.
Yeh distinction yahan implement ki hai.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class Feedback:
    severity: str        # 'good' | 'warning' | 'error'
    en: str
    ur: str
    joint: str
    penalty: int         # score se minus


class FormChecker:
    def check(self, exercise, angles, phase='up', reps=0):
        fn = getattr(self, f'_check_{exercise.lower().replace("-","_").replace(" ","_")}', self._generic)
        feedbacks = fn(angles, phase, reps)
        score = max(0, min(100, 100 - sum(f.penalty for f in feedbacks if f.severity != 'good')))
        return feedbacks, score

    def _check_squat(self, A, phase, reps):
        F = []
        knee = A.get('knee')
        back = A.get('back')

        if phase in ('down','bottom'):
            if knee and knee > 128:
                F.append(Feedback('warning', "Go deeper! Knee angle too wide.",
                                  "Aur neeche jao! Ghutna zyada seedha.", 'knee', 20))
            if phase == 'bottom' and back and back < 148:
                F.append(Feedback('error', "Back rounding! Injury risk — chest up!",
                                  "Kamar jhuk rahi! Seena upar karo!", 'back', 30))

        if not F:
            F.append(Feedback('good', "Perfect squat depth and form!",
                              "Zabardast squat! Bilkul perfect!", 'overall', 0))
        return F

    def _check_push_up(self, A, phase, reps):
        F = []
        elbow = A.get('elbow')
        back  = A.get('back')

        if phase == 'down' and elbow and elbow > 118:
            F.append(Feedback('warning', "Lower your chest more!",
                              "Seena aur neeche lao!", 'elbow', 20))
        if back and back < 163:
            F.append(Feedback('error', "Keep body straight — hips too high/low!",
                              "Jism seedha rakho — kamar upar ya neeche!", 'back', 25))
        if not F:
            F.append(Feedback('good', "Perfect push-up! Solid form.",
                              "Behtareen push-up! Solid form.", 'overall', 0))
        return F

    def _check_deadlift(self, A, phase, reps):
        F = []
        back = A.get('back')
        if back and back < 162:
            F.append(Feedback('error', "DANGER: Round back! Stop and reset.",
                              "KHATRE KI BAAT: Kamar jhuk rahi! Ruko!", 'back', 35))
        if not F:
            F.append(Feedback('good', "Excellent deadlift! Neutral spine.",
                              "Kamaal deadlift! Reehdh seedhi.", 'overall', 0))
        return F

    def _check_bicep_curl(self, A, phase, reps):
        F = []
        sh = A.get('left_shoulder_angle')
        elbow = A.get('elbow')
        if sh and sh > 38:
            F.append(Feedback('warning', "No swinging! Lock those elbows.",
                              "Swing mat karo! Kohniyan thaam ke rakho.", 'shoulder', 20))
        if phase == 'top' and elbow and elbow > 62:
            F.append(Feedback('warning', "Curl higher! Full range needed.",
                              "Aur upar curl karo! Puri range mein.", 'elbow', 15))
        if not F:
            F.append(Feedback('good', "Clean curl! Great control.",
                              "Saaf curl! Behtareen control.", 'overall', 0))
        return F

    def _check_lunge(self, A, phase, reps):
        F = []
        knee = A.get('left_knee', A.get('knee'))
        back = A.get('back')
        if phase == 'down' and knee and knee > 118:
            F.append(Feedback('warning', "Bend front knee to 90°.",
                              "Agla ghutna 90° tak modho.", 'knee', 20))
        if back and back < 163:
            F.append(Feedback('warning', "Keep torso upright!",
                              "Jism seedha rakho!", 'back', 15))
        if not F:
            F.append(Feedback('good', "Great lunge! Perfect balance.",
                              "Kamaal lunge! Behtareen balance.", 'overall', 0))
        return F

    def _check_plank(self, A, phase, reps):
        F = []
        back = A.get('back')
        if back:
            if back < 163:
                F.append(Feedback('error', "Hips sagging! Engage core NOW.",
                                  "Kamar jhuk rahi! Core tight karo.", 'back', 30))
            elif back > 197:
                F.append(Feedback('warning', "Hips too high — lower them.",
                                  "Kamar bahut upar — thoda neeche.", 'back', 20))
        if not F:
            F.append(Feedback('good', "Perfect plank! Hold it!",
                              "Kamaal plank! Is position mein raho!", 'overall', 0))
        return F

    def _check_shoulder_press(self, A, phase, reps):
        F = []
        elbow = A.get('elbow')
        back  = A.get('back')
        if phase == 'down' and elbow and elbow < 82:
            F.append(Feedback('warning', "Lower to shoulder level.",
                              "Shoulder tak neeche lao.", 'elbow', 15))
        if back and back < 168:
            F.append(Feedback('warning', "Don't lean back! Core tight.",
                              "Peechhe mat jhuko! Core tight.", 'back', 20))
        if not F:
            F.append(Feedback('good', "Great press! Full ROM achieved.",
                              "Behtareen press! Puri range.", 'overall', 0))
        return F

    def _generic(self, A, phase, reps):
        return [Feedback('good', "Keep it up!", "Jari rakho!", 'overall', 0)]
