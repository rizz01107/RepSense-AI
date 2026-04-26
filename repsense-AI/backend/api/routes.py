"""
routes.py
---------
REST endpoints — WebSocket ke ilawa jo bhi HTTP chahiye.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")


EXERCISES = [
    {"name": "Squat",           "emoji": "🏋️", "level": "Beginner",     "muscles": ["Quads","Glutes","Core"]},
    {"name": "Push-up",         "emoji": "💪", "level": "Beginner",     "muscles": ["Chest","Triceps","Core"]},
    {"name": "Deadlift",        "emoji": "🔱", "level": "Intermediate", "muscles": ["Back","Glutes","Hamstrings"]},
    {"name": "Bicep Curl",      "emoji": "💎", "level": "Beginner",     "muscles": ["Biceps"]},
    {"name": "Lunge",           "emoji": "🦵", "level": "Beginner",     "muscles": ["Quads","Glutes","Balance"]},
    {"name": "Plank",           "emoji": "🧘", "level": "Beginner",     "muscles": ["Core","Shoulders"]},
    {"name": "Shoulder Press",  "emoji": "🏆", "level": "Intermediate", "muscles": ["Shoulders","Triceps"]},
    {"name": "Jumping Jack",    "emoji": "⭐", "level": "Beginner",     "muscles": ["Full Body","Cardio"]},
    {"name": "Mountain Climber","emoji": "🏔️", "level": "Intermediate", "muscles": ["Core","Cardio"]},
    {"name": "Burpee",          "emoji": "🔥", "level": "Advanced",     "muscles": ["Full Body","Cardio"]},
]


@router.get("/exercises")
async def get_exercises():
    return {"exercises": EXERCISES}


@router.get("/health")
async def health():
    return {"status": "ok", "app": "RepSense AI", "version": "2.0.0"}
