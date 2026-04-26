"""deadlift.py — Deadlift rules"""
DEADLIFT_RULES = {
    "name": "Deadlift", "emoji": "🔱",
    "muscles": ["Lower Back", "Glutes", "Hamstrings", "Traps", "Forearms"],
    "angle_key": "hip", "down_threshold": 110, "up_threshold": 160, "rep_at": "top",
    "coaching_tips": {
        "en": ["Neutral spine at ALL times", "Bar close to body throughout", "Hips drive the movement"],
        "ur": ["Har waqt reehdh seedhi rakho", "Bar hamesha jism ke qareeb", "Kamar se movement drive karo"],
    },
    "common_mistakes": {
        "round_back": {"en": "DANGER: Round back! Stop immediately.", "ur": "KHATRE KI BAAT: Kamar jhuki! Ruko."},
        "bar_away":   {"en": "Bar drifting away from body!", "ur": "Bar jism se door ja raha hai!"},
    },
}
