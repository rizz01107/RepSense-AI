@echo off
title RepSense AI — Setup
color 0B
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║          RepSense AI — Setup                 ║
echo  ║          AI Seekho 2026  🇵🇰                  ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo [1/4] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 ( echo ERROR: Python not found! Install from python.org && pause && exit )
call venv\Scripts\activate

echo.
echo [2/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [3/4] Installing Node.js dependencies...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Setup complete!
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  HOW TO RUN:                                 ║
echo  ║                                              ║
echo  ║  Terminal 1 (Backend):                       ║
echo  ║    venv\Scripts\activate                     ║
echo  ║    cd backend                                ║
echo  ║    python main.py                            ║
echo  ║                                              ║
echo  ║  Terminal 2 (Frontend):                      ║
echo  ║    cd frontend                               ║
echo  ║    npm run dev                               ║
echo  ║                                              ║
echo  ║  Open: http://localhost:5173                  ║
echo  ║                                              ║
echo  ║  Optional: Add GEMINI_API_KEY in .env        ║
echo  ╚══════════════════════════════════════════════╝
echo.
pause
