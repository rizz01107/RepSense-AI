"""
squat.py — Squat specific rules and coaching tips
"""

SQUAT_RULES = {
    "name": "Squat",
    "emoji": "🏋️",
    "muscles": ["Quadriceps", "Glutes", "Hamstrings", "Core", "Calves"],
    "angle_key": "knee",
    "down_threshold": 115,
    "up_threshold": 155,
    "rep_at": "bottom",

    "ideal_angles": {
        "knee": {"min": 80, "max": 100},
        "hip": {"min": 80, "max": 110},
        "back": {"min": 155, "max": 180},
    },

    "coaching_tips": {
        "en": [
            "Keep your chest up throughout the movement",
            "Push your knees out — don't let them cave in",
            "Drive through your heels on the way up",
            "Brace your core before descending",
            "Keep the bar (or hands) stable throughout",
        ],
        "ur": [
            "Puri movement mein seena upar rakho",
            "Ghutne bahar rakho — andar mat aane do",
            "Upar aate waqt aedon se dhakka do",
            "Neeche jane se pehle core tight karo",
            "Haath/bar puri movement mein stable rakho",
        ],
    },

    "common_mistakes": {
        "knee_cave": {
            "en": "Knees caving in! Push them outward.",
            "ur": "Ghutne andar aa rahe hain! Bahar dhakko.",
        },
        "forward_lean": {
            "en": "Too much forward lean — chest up!",
            "ur": "Zyada aage jhuk rahe ho — seena upar!",
        },
        "insufficient_depth": {
            "en": "Not deep enough! Break parallel.",
            "ur": "Itna neeche nahi gaye! Aur neeche jao.",
        },
        "heel_raise": {
            "en": "Heels lifting! Keep full foot contact.",
            "ur": "Aedian uth rahi hain! Poora paaon zameen pe rakho.",
        },
    },
}
