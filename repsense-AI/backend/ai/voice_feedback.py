"""
voice_feedback.py
-----------------
Text-to-speech for coaching feedback.
pyttsx3 offline kaam karta hai — no internet needed.
"""

import threading
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False


class VoiceFeedback:
    def __init__(self, lang='en'):
        self.lang = lang
        self.engine = None
        self.enabled = TTS_AVAILABLE
        self._lock = threading.Lock()
        if TTS_AVAILABLE:
            self._init_engine()

    def _init_engine(self):
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 165)
            self.engine.setProperty('volume', 0.9)
        except Exception:
            self.enabled = False

    def speak(self, text: str):
        if not self.enabled or not text:
            return
        # Background thread — main loop block nahi hota
        threading.Thread(target=self._say, args=(text,), daemon=True).start()

    def _say(self, text):
        with self._lock:
            try:
                if self.engine:
                    self.engine.say(text)
                    self.engine.runAndWait()
            except Exception:
                pass

    def set_lang(self, lang):
        self.lang = lang
