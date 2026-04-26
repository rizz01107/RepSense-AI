"""
main.py — RepSense AI Backend
"""

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os, uvicorn

from api.routes    import router
from api.websocket import ws_handler

app = FastAPI(title="RepSense AI", version="2.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(router)


@app.websocket("/ws/workout")
async def workout_ws(ws: WebSocket):
    await ws_handler(ws)


# Serve built React frontend
dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist, "assets")), name="assets")

    @app.get("/")
    async def root():
        return FileResponse(os.path.join(dist, "index.html"))

    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        f = os.path.join(dist, full_path)
        if os.path.isfile(f):
            return FileResponse(f)
        return FileResponse(os.path.join(dist, "index.html"))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False, workers=1)
