# 💪 RepSense AI
### Real-Time AI Gym Coach — AI Seekho 2026 🇵🇰

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-AI-purple?style=flat-square)
![Free](https://img.shields.io/badge/Cost-FREE-gold?style=flat-square)

---

## 🚀 Quick Start

### Step 1 — Setup (Windows)
```bash
# Double click setup.bat
# OR manually:
python -m venv venv
venv\Scripts\activate
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### Step 2 — Add Gemini API Key (Optional)
```bash
# Edit .env file:
GEMINI_API_KEY=your_key_here
# Get free key: https://aistudio.google.com/app/apikey
```

### Step 3 — Run
```bash
# Terminal 1 — Backend
venv\Scripts\activate
cd backend
python main.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Step 4 — Open Browser
```
http://localhost:5173
```

---

## ☁️ Deploy to Google Cloud Run

```bash
# Build frontend
cd frontend && npm run build

# Deploy
gcloud run deploy repsense-ai \
  --source deploy/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## 🧠 Architecture

```
Browser Camera (30fps)
    ↓
useCamera Hook (captures JPEG at 20fps)
    ↓
WebSocket → Backend
    ↓
PoseDetector (MediaPipe every frame + YOLO every 3rd)
    ↓
Kalman Filter (removes jitter)
    ↓
AngleCalculator (EMA smoothed angles)
    ↓
RepCounter (State Machine)
    ↓
FormChecker (Phase-aware rules)
    ↓
GeminiFeedback (cached AI coaching)
    ↓
WebSocket → Frontend
    ↓
Camera + RepCounter + FeedbackPanel
```

---

## 📁 Project Structure

```
repsense-ai/
├── backend/
│   ├── core/
│   │   ├── pose_detector.py    # YOLOv8 + MediaPipe + Kalman Filter
│   │   ├── angle_calculator.py # EMA smoothed angles + outlier rejection
│   │   ├── rep_counter.py      # State machine: READY→DOWN→BOTTOM→UP→COUNT
│   │   └── form_checker.py     # Phase-aware form rules per exercise
│   ├── exercises/              # Per-exercise rules and coaching data
│   ├── ai/
│   │   ├── gemini_feedback.py  # Gemini AI + LRU cache + local fallback
│   │   └── voice_feedback.py   # English + Urdu TTS
│   ├── api/
│   │   ├── routes.py           # REST endpoints
│   │   └── websocket.py        # Optimized WebSocket + frame dropping
│   └── main.py                 # FastAPI entry point
├── frontend/
│   └── src/
│       ├── components/         # Camera, RepCounter, FeedbackPanel, Dashboard
│       ├── pages/              # Home, Workout, Progress
│       └── hooks/              # useCamera, useWebSocket
├── deploy/                     # Docker + Cloud Run config
├── tests/                      # Pytest unit tests
└── .env                        # API keys
```

---

## 🏋️ Exercises Supported

| Exercise | Level | Key Joints |
|----------|-------|-----------|
| 🏋️ Squat | Beginner | Knee, Hip, Back |
| 💪 Push-up | Beginner | Elbow, Back |
| 🔱 Deadlift | Intermediate | Back, Hip |
| 💎 Bicep Curl | Beginner | Elbow, Shoulder |
| 🦵 Lunge | Beginner | Knee, Back |
| 🧘 Plank | Beginner | Back alignment |
| 🏆 Shoulder Press | Intermediate | Elbow, Back |
| ⭐ Jumping Jack | Beginner | Shoulder |
| 🏔️ Mountain Climber | Intermediate | Knee |
| 🔥 Burpee | Advanced | Full body |

---

## 🔑 Key Technical Solutions

### Jitter Handling
- **Kalman Filter** on each joint independently
- **Median buffer** (last 4 frames) instead of mean — outlier resistant
- **Outlier rejection** — 40°+ angle jump in one frame = ignore

### FPS Optimization
- YOLO runs every 3rd frame in background thread
- MediaPipe runs every frame (fast)
- Adaptive JPEG quality (55-85%) based on current FPS
- Frame queue maxsize=2 — older frames dropped to prevent lag

### Rep Counting
- State machine: READY → GOING_DOWN → BOTTOM → GOING_UP → COUNT
- Debounce: minimum 0.75 seconds per rep
- Velocity check: >480°/sec = probably noise, skip
- Phase-aware: deadlift counts at top, squat at bottom

### AI Feedback
- LRU cache (60 entries) — same situation doesn't call API twice
- Rate limiting: min 3 seconds between Gemini calls
- Automatic fallback to local templates if no API key

---

## #AISeekho2026 #VibeKaregaPakistan 🇵🇰
