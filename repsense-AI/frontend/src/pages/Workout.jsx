import { useState, useCallback, useRef } from "react";
import Camera        from "../components/Camera";
import RepCounter    from "../components/RepCounter";
import FeedbackPanel from "../components/FeedbackPanel";
import ExerciseSelect from "../components/ExerciseSelect";
import { useCamera }    from "../hooks/useCamera";
import { useWebSocket } from "../hooks/useWebSocket";

const EMOJIS = {"Squat":"🏋️","Push-up":"💪","Deadlift":"🔱","Bicep Curl":"💎",
  "Lunge":"🦵","Plank":"🧘","Shoulder Press":"🏆","Jumping Jack":"⭐",
  "Mountain Climber":"🏔️","Burpee":"🔥"};

export default function Workout({ exercise:initEx, language, onNavigate, onWorkoutComplete, theme }) {
  const dark = theme === "dark";
  const [exercise,  setExercise]  = useState(initEx || "Squat");
  const [reps,      setReps]      = useState(0);
  const [phase,     setPhase]     = useState("up");
  const [score,     setScore]     = useState(100);
  const [angles,    setAngles]    = useState({});
  const [annotated, setAnnotated] = useState(null);
  const [messages,  setMessages]  = useState([
    { text:"Welcome! Select exercise, start camera, and begin 💪", type:"ai" }
  ]);
  const [aiLoad,  setAiLoad]  = useState(false);
  const [isFast,  setIsFast]  = useState(false);
  const [fps,     setFps]     = useState(0);
  const [target,  setTarget]  = useState(10);
  const [tab,     setTab]     = useState("camera");
  const t0 = useRef(Date.now());

  const bg   = dark ? "#030712" : "#f8fafc";
  const card = dark ? "rgba(15,22,41,0.7)" : "#fff";
  const bdr  = dark ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const txt  = dark ? "#f8fafc" : "#0f172a";
  const sub  = dark ? "#64748b" : "#94a3b8";

  const addMsg = (text, type="ai") =>
    setMessages(p => [...p.slice(-30), { text, type }]);

  const handleWsMsg = useCallback((msg) => {
    if (msg.type !== "result") return;
    if (msg.frame)        setAnnotated(msg.frame);
    if (msg.angles)       setAngles(msg.angles);
    if (msg.reps != null) setReps(msg.reps);
    if (msg.phase)        setPhase(msg.phase);
    if (msg.score != null)setScore(msg.score);
    if (msg.fps)          setFps(msg.fps);
    if (msg.is_fast!=null)setIsFast(msg.is_fast);
    if (msg.feedback?.length) {
      const f = msg.feedback[0];
      addMsg(f.msg, f.sev==="error"?"error":f.sev==="warning"?"warning":"good");
    }
    if (msg.ai_msg) { setAiLoad(false); addMsg(msg.ai_msg,"ai"); }
    if (msg.rep)    setAiLoad(true);
    if (msg.milestone) addMsg(`🎉 ${msg.reps} reps! Keep going!`, "ai");
  }, []);

  const { send, connected } = useWebSocket(handleWsMsg);
  const sendFrame = useCallback((b64) => send({ type:"frame", data:b64 }), [send]);
  const { videoRef, active, error, start, stop } = useCamera({ onFrame:sendFrame, frameRate:20 });

  function handleStart() {
    start();
    send({ type:"config", exercise, language });
    addMsg(`${exercise} selected. Camera ready — let's go! 🚀`, "ai");
    t0.current = Date.now();
    setReps(0); setScore(100); setAngles({}); setAnnotated(null);
  }

  function handleStop() {
    stop();
    const dur = Math.round((Date.now() - t0.current) / 1000);
    onWorkoutComplete?.(reps, exercise, dur, score);
    addMsg(`Session done! ${reps} reps completed. Amazing work! 🎊`, "ai");
  }

  function changeExercise(ex) {
    setExercise(ex); setReps(0); setScore(100); setTab("camera");
    if (active) { send({ type:"config", exercise:ex, language }); addMsg(`Switched to ${ex}!`, "ai"); }
  }

  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"'DM Sans',sans-serif" }}>

      {/* Topbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 28px", borderBottom:`1px solid ${bdr}`,
        backdropFilter:"blur(20px)",
        background: dark?"rgba(3,7,18,0.85)":"rgba(248,250,252,0.9)",
        position:"sticky", top:0, zIndex:100 }}>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => onNavigate("home")} style={{
            background:"none", border:"none", cursor:"pointer", fontSize:22, color:sub }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800 }}>
            Rep<span style={{color:"#00d4ff"}}>Sense</span> AI
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:sub }}>
            <span style={{ width:7, height:7, borderRadius:"50%", display:"inline-block",
              background: connected?"#22c55e":"#ef4444",
              animation: connected?"blink 2s infinite":"none" }}/>
            {connected ? "Connected" : "Offline"}
          </div>
          {fps > 0 && (
            <div style={{ padding:"3px 10px", borderRadius:6, fontSize:12, fontWeight:600,
              background: fps>20?"rgba(0,255,136,0.1)":"rgba(249,115,22,0.1)",
              color: fps>20?(dark?"#6ee7b7":"#059669"):(dark?"#fb923c":"#ea580c") }}>
              {fps} FPS
            </div>
          )}
          {!active ? (
            <button onClick={handleStart} style={{ padding:"9px 22px", borderRadius:10,
              fontWeight:700, fontSize:14,
              background:"linear-gradient(135deg,#00d4ff,#a855f7)",
              color:"#030712", border:"none", cursor:"pointer" }}>
              📷 Start Camera
            </button>
          ) : (
            <button onClick={handleStop} style={{ padding:"9px 22px", borderRadius:10,
              fontWeight:700, fontSize:14,
              background:"rgba(239,68,68,0.12)", color:dark?"#f87171":"#dc2626",
              border:"1px solid rgba(239,68,68,0.3)", cursor:"pointer" }}>
              ⏹ Stop & Save
            </button>
          )}
        </div>
      </div>

      {/* Layout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px",
        gap:20, padding:20, alignItems:"start" }}>

        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4,
            background: dark?"rgba(255,255,255,0.04)":"#f1f5f9",
            padding:4, borderRadius:12, width:"fit-content" }}>
            {[["camera","📷 Camera"],["exercises","🏋️ Exercises"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding:"7px 20px", borderRadius:9, fontSize:13, fontWeight:600,
                border:"none", cursor:"pointer", transition:"all 0.2s",
                background: tab===id ? (dark?"rgba(0,212,255,0.12)":"#fff") : "transparent",
                color: tab===id ? (dark?"#00d4ff":"#0ea5e9") : sub,
                boxShadow: tab===id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}>{label}</button>
            ))}
          </div>

          {tab === "camera" ? (
            <>
              <Camera videoRef={videoRef} annotatedFrame={annotated}
                angles={angles} active={active} theme={theme} />
              {error && (
                <div style={{ padding:"12px 18px", borderRadius:12, fontSize:13,
                  background:"rgba(239,68,68,0.1)", color:dark?"#f87171":"#dc2626",
                  border:"1px solid rgba(239,68,68,0.2)" }}>⚠️ {error}</div>
              )}
            </>
          ) : (
            <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16, padding:24 }}>
              <ExerciseSelect selected={exercise} onSelect={changeExercise} theme={theme} />
            </div>
          )}

          {/* Exercise bar */}
          <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:14,
            padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:28 }}>{EMOJIS[exercise]||"💪"}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{exercise}</div>
                <div style={{ fontSize:12, color:sub }}>Target: {target} reps</div>
              </div>
            </div>
            <select value={target} onChange={e => setTarget(+e.target.value)} style={{
              padding:"6px 12px", borderRadius:8, border:`1px solid ${bdr}`,
              background: dark?"rgba(255,255,255,0.05)":"#f8fafc",
              color:txt, fontSize:13, cursor:"pointer" }}>
              {[6,8,10,12,15,20].map(n => <option key={n} value={n}>{n} reps</option>)}
            </select>
          </div>

          {/* Tips */}
          {!active && (
            <div style={{ background: dark?"rgba(0,212,255,0.05)":"#f0f9ff",
              border:`1px solid ${dark?"rgba(0,212,255,0.15)":"#bae6fd"}`,
              borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontWeight:700, fontSize:13, color:dark?"#00d4ff":"#0284c7", marginBottom:10 }}>
                💡 Tips for best results
              </div>
              {["Stand 2-3 feet from camera","Ensure full body is visible",
                "Good lighting helps accuracy","Wear fitted clothing if possible"].map((t,i) => (
                <div key={i} style={{ fontSize:13, color:sub,
                  display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <span style={{color:"#00d4ff"}}>→</span> {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16, padding:24 }}>
            <RepCounter count={reps} target={target} phase={phase}
              score={score} theme={theme} isfast={isFast} />
          </div>
          <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16, overflow:"hidden" }}>
            <FeedbackPanel messages={messages} isLoading={aiLoad} theme={theme} />
          </div>
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
