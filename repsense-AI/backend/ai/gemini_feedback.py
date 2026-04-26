"""
gemini_feedback.py
------------------
Smart Gemini integration:
- Key hai → Gemini call karo
- Key nahi → Local templates se fallback
- Same situation → Cache hit (API call bachao)
- Rate limit → Min 3 sec between calls
"""

import os, hashlib, json, time
from collections import OrderedDict
import google.generativeai as genai


class LRU:
    def __init__(self, cap=60):
        self.d = OrderedDict()
        self.cap = cap
    def get(self, k):
        if k in self.d:
            self.d.move_to_end(k)
            return self.d[k]
    def put(self, k, v):
        self.d[k] = v
        self.d.move_to_end(k)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)


LOCAL_FB = {
    'en': {
        'start':     "Let's go! Get in position and crush it!",
        'good':      "Excellent form! Stay locked in.",
        'depth':     "Deeper! You've got more range in you.",
        'back':      "Neutral spine! Chest up, core tight.",
        'speed':     "Slow it down! Control beats speed every time.",
        'swing':     "No momentum! Strict reps only.",
        'milestone': "🔥 {n} reps! You're unstoppable!",
        'halfway':   "Halfway! You're looking strong — keep it!",
    },
    'ur': {
        'start':     "Chalo shuru karo! Position lo aur tod do!",
        'good':      "Behtareen form! Aise hi jari rakho.",
        'depth':     "Aur neeche! Tumhari range aur hai.",
        'back':      "Kamar seedhi! Seena upar, core tight.",
        'speed':     "Dheere karo! Control speed se behtar hai.",
        'swing':     "Momentum nahi! Sirf strict reps.",
        'milestone': "🔥 {n} reps! Tum rok nahi sakte!",
        'halfway':   "Adha ho gaya! Mضبوط lag rahe ho!",
    }
}


class GeminiFeedback:
    def __init__(self):
        self.key = os.getenv('GEMINI_API_KEY', '')
        self.model = None
        self.cache = LRU(60)
        self.t_last = 0
        self.min_gap = 3.0

        if self.key:
            try:
                genai.configure(api_key=self.key)
                self.model = genai.GenerativeModel(
                    'gemini-2.0-flash',
                    generation_config={'temperature': 0.75, 'max_output_tokens': 120}
                )
            except Exception as e:
                print(f"[Gemini] Setup failed: {e}")

    def get(self, ctx: dict, lang='en') -> str:
        now = time.time()
        is_milestone = ctx.get('is_milestone', False)
        issue        = ctx.get('issue')

        # Rate check
        if not is_milestone and (now - self.t_last) < self.min_gap:
            return self._local(ctx, lang)

        if not self.model:
            return self._local(ctx, lang)

        # Cache key — round angles to nearest 10
        ck = hashlib.md5(json.dumps({
            'ex': ctx.get('exercise'),
            'phase': ctx.get('phase'),
            'issue': issue,
            'rep_bucket': (ctx.get('reps', 0) // 5) * 5,
        }, sort_keys=True).encode()).hexdigest()

        cached = self.cache.get(ck)
        if cached and not is_milestone:
            return cached

        try:
            prompt = self._prompt(ctx, lang)
            r = self.model.generate_content(prompt)
            txt = r.text.strip()
            self.cache.put(ck, txt)
            self.t_last = now
            return txt
        except Exception:
            return self._local(ctx, lang)

    def _prompt(self, ctx, lang):
        lang_inst = "Respond in Urdu script only." if lang == 'ur' else "Respond in English only."
        milestone_line = f"This is rep #{ctx['reps']} — a milestone! Celebrate first." if ctx.get('is_milestone') else ""
        issue_line = f"Form issue: {ctx.get('issue','none')}" if ctx.get('issue') else "Form looks good."
        return f"""You are RepSense AI, a high-energy professional fitness coach. {lang_inst}

Exercise: {ctx.get('exercise')}
Reps: {ctx.get('reps',0)} | Phase: {ctx.get('phase','up')} | Form score: {ctx.get('score',100)}/100
{issue_line} | Rep speed: {ctx.get('rep_time',2):.1f}s
{milestone_line}

One coaching message, max 2 sentences. Direct and energetic. No asterisks or markdown."""

    def _local(self, ctx, lang):
        T = LOCAL_FB.get(lang, LOCAL_FB['en'])
        if ctx.get('is_milestone'):
            return T['milestone'].format(n=ctx.get('reps', 0))
        issue = ctx.get('issue')
        if issue:
            return T.get(issue, T['good'])
        if ctx.get('score', 100) >= 88:
            return T['good']
        return T['good']
