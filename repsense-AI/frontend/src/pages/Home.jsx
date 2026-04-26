import { useState, useEffect } from "react";
import ExerciseSelect from "../components/ExerciseSelect";

export default function Home({ onNavigate, onSelectExercise, language, onLangChange, stats, theme, onThemeToggle }) {
  const dark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fade = (d=0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.6s ease ${d}ms`,
  });

  const bg   = dark ? "#030712" : "#f8fafc";
  const card = dark ? "rgba(15,22,41,0.8)" : "#fff";
  const bdr  = dark ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const txt  = dark ? "#f8fafc" : "#0f172a";
  const sub  = dark ? "#64748b" : "#94a3b8";

  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"'DM Sans',sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 40px", borderBottom:`1px solid ${bdr}`,
        backdropFilter:"blur(20px)",
        background: dark ? "rgba(3,7,18,0.8)" : "rgba(248,250,252,0.9)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:10, fontSize:20,
            background:"linear-gradient(135deg,#00d4ff,#a855f7)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>💪</div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800 }}>
            Rep<span style={{color:"#00d4ff"}}>Sense</span> AI
          </span>
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Lang toggle */}
          <div style={{ display:"flex", gap:3, padding:4,
            background: dark?"rgba(255,255,255,0.06)":"#f1f5f9", borderRadius:8 }}>
            {["en","ur"].map(l => (
              <button key={l} onClick={() => onLangChange(l)} style={{
                padding:"4px 12px", borderRadius:6, fontSize:13, fontWeight:600,
                cursor:"pointer", border:"none", transition:"all 0.2s",
                background: language===l ? (dark?"#00d4ff":"#0ea5e9") : "transparent",
                color: language===l ? "#030712" : sub,
              }}>{l.toUpperCase()}</button>
            ))}
          </div>

          {/* Theme */}
          <button onClick={onThemeToggle} style={{
            width:36, height:36, borderRadius:8, border:"none", cursor:"pointer",
            background: dark?"rgba(255,255,255,0.06)":"#f1f5f9", fontSize:18,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{dark?"☀️":"🌙"}</button>

          <button onClick={() => onNavigate("progress")} style={{
            padding:"8px 20px", borderRadius:8, fontSize:13, fontWeight:600,
            background:"transparent", border:`1px solid ${bdr}`, color:sub, cursor:"pointer",
          }}>📊 Progress</button>

          <button onClick={() => onNavigate("workout")} style={{
            padding:"8px 22px", borderRadius:8, fontSize:13, fontWeight:700,
            background:"linear-gradient(135deg,#00d4ff,#a855f7)",
            color:"#030712", border:"none", cursor:"pointer",
          }}>Start Workout →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:"80px 40px 60px", textAlign:"center",
        display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>

        <div style={{ ...fade(0), display:"inline-flex", alignItems:"center", gap:8,
          padding:"7px 20px", borderRadius:100,
          border:`1px solid ${dark?"rgba(0,212,255,0.3)":"rgba(14,165,233,0.3)"}`,
          background: dark?"rgba(0,212,255,0.07)":"rgba(14,165,233,0.07)",
          fontSize:13, color: dark?"#00d4ff":"#0284c7", fontWeight:500 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e",
            display:"inline-block", animation:"pulse 2s infinite" }}/>
          AI-Powered Real-Time Fitness Coach
        </div>

        <h1 style={{ ...fade(100), fontFamily:"'Syne',sans-serif",
          fontSize:"clamp(40px,7vw,76px)", fontWeight:800,
          lineHeight:1.06, letterSpacing:"-2px", margin:0 }}>
          Train Smarter<br/>
          with <span style={{
            background:"linear-gradient(135deg,#00d4ff 0%,#a855f7 50%,#00ff88 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>RepSense AI</span>
        </h1>

        <p style={{ ...fade(200), fontSize:18, color:sub, maxWidth:560, lineHeight:1.7, margin:0 }}>
          Real-time pose detection, automatic rep counting, instant form correction.
          English + Urdu coaching. 100% free.
        </p>

        <div style={{ ...fade(300), display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={() => onNavigate("workout")}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,212,255,0.3)"}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}
            style={{ padding:"14px 32px", borderRadius:12, fontSize:15, fontWeight:700,
              background:"linear-gradient(135deg,#00d4ff,#a855f7)",
              color:"#030712", border:"none", cursor:"pointer", transition:"all 0.25s" }}>
            🎯 Start Workout
          </button>
          <button onClick={() => onNavigate("progress")}
            onMouseOver={e=>{e.currentTarget.style.borderColor="#00d4ff";e.currentTarget.style.color="#00d4ff"}}
            onMouseOut={e=>{e.currentTarget.style.borderColor=bdr;e.currentTarget.style.color=txt}}
            style={{ padding:"14px 32px", borderRadius:12, fontSize:15, fontWeight:700,
              background:"transparent", color:txt, border:`1px solid ${bdr}`,
              cursor:"pointer", transition:"all 0.25s" }}>
            📊 View Progress
          </button>
        </div>
      </section>

      {/* Stats */}
      <div style={{ display:"flex", gap:40, padding:"32px 40px", justifyContent:"center",
        flexWrap:"wrap", borderTop:`1px solid ${bdr}`, borderBottom:`1px solid ${bdr}` }}>
        {[
          { val: stats.totalWorkouts||0, label:"Workouts" },
          { val: stats.totalReps||0,     label:"Total Reps" },
          { val: "10+",                  label:"Exercises" },
          { val: "FREE",                 label:"Forever" },
        ].map(s => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:34, fontWeight:800, color:"#00d4ff" }}>
              {s.val}
            </div>
            <div style={{ fontSize:13, color:sub, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ padding:"60px 40px" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:34, fontWeight:800,
          textAlign:"center", marginBottom:8 }}>
          Why <span style={{color:"#00d4ff"}}>RepSense AI?</span>
        </h2>
        <p style={{ textAlign:"center", color:sub, marginBottom:44 }}>
          Professional coaching — no gym membership needed
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
          gap:18, maxWidth:1100, margin:"0 auto" }}>
          {[
            { icon:"👁️", t:"Real-Time Pose Detection",   d:"YOLOv8 + MediaPipe tracks 33 body joints. Kalman filter removes camera jitter." },
            { icon:"🔢", t:"Smart Rep Counter",           d:"State machine logic — no false positives. Counts only complete movement cycles." },
            { icon:"⚡", t:"Instant Form Feedback",       d:"Phase-aware corrections — like a real coach watching your every move." },
            { icon:"🧠", t:"Gemini AI Coach",             d:"Google Gemini gives personalized tips. Works without API key too." },
            { icon:"🇵🇰", t:"English + Urdu",            d:"Full bilingual support. Switch languages anytime. Voice feedback in both." },
            { icon:"🆓", t:"100% Free Forever",           d:"No subscriptions. No hidden fees. Open source. Works on any device." },
          ].map(f => (
            <div key={f.t}
              onMouseOver={e=>{e.currentTarget.style.borderColor=dark?"rgba(0,212,255,0.3)":"#7dd3fc";e.currentTarget.style.transform="translateY(-4px)"}}
              onMouseOut={e=>{e.currentTarget.style.borderColor=bdr;e.currentTarget.style.transform=""}}
              style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16,
                padding:26, transition:"all 0.25s", cursor:"default" }}>
              <div style={{ fontSize:34, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, marginBottom:10 }}>{f.t}</div>
              <div style={{ fontSize:13, color:sub, lineHeight:1.7 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Exercise Select */}
      <section style={{ padding:"60px 40px",
        background: dark?"rgba(10,15,28,0.5)":"#f1f5f9",
        borderTop:`1px solid ${bdr}` }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:34, fontWeight:800,
          textAlign:"center", marginBottom:8 }}>
          10+ <span style={{color:"#00ff88"}}>Exercises</span>
        </h2>
        <p style={{ textAlign:"center", color:sub, marginBottom:40 }}>
          Click any exercise to start your workout
        </p>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <ExerciseSelect selected={null}
            onSelect={ex => onSelectExercise(ex)} theme={theme} />
        </div>
      </section>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}`}</style>
    </div>
  );
}
