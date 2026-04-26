"""pushup.py — Push-up rules"""

PUSHUP_RULES = {
    "name": "Push-up",
    "emoji": "💪",
    "muscles": ["Chest", "Triceps", "Front Deltoids", "Core"],
    "angle_key": "elbow",
    "down_threshold": 110,
    "up_threshold": 155,
    "rep_at": "bottom",
    "ideal_angles": {
        "elbow": {"min": 85, "max": 105},
        "back":  {"min": 168, "max": 185},
    },
    "coaching_tips": {
        "en": ["Keep elbows at 45° from body", "Lower chest to near floor", "Keep body perfectly straight"],
        "ur": ["Kohniyan jism se 45° pe rakho", "Seena zameen ke qareeb lao", "Jism bilkul seedha rakho"],
    },
    "common_mistakes": {
        "flared_elbows": {"en": "Elbows too wide!", "ur": "Kohniyan bahut chori hain!"},
        "sagging_hips":  {"en": "Hips sagging — engage core!", "ur": "Kamar jhuk rahi — core tight karo!"},
        "short_range":   {"en": "Go lower! Full range of motion.", "ur": "Aur neeche! Puri range mein karo."},
    },
}
