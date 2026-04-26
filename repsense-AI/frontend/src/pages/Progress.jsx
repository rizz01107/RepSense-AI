import Dashboard from "../components/Dashboard";

export default function Progress({ data, onNavigate, theme }) {
  const dark = theme === "dark";
  const bdr  = dark ? "rgba(255,255,255,0.07)" : "#e2e8f0";

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'DM Sans',sans-serif",
      background: dark?"#030712":"#f8fafc", color: dark?"#f8fafc":"#0f172a" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 28px", borderBottom:`1px solid ${bdr}`,
        backdropFilter:"blur(20px)",
        background: dark?"rgba(3,7,18,0.85)":"rgba(248,250,252,0.9)",
        position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => onNavigate("home")} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:22, color: dark?"#64748b":"#94a3b8" }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800 }}>
            📊 Your <span style={{color:"#a855f7"}}>Progress</span>
          </span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { if(confirm("Clear all workout history?")){ localStorage.removeItem("repsense_data"); window.location.reload(); }}} style={{
            padding:"7px 16px", borderRadius:8, fontSize:13, fontWeight:600,
            background:"rgba(239,68,68,0.08)", color: dark?"#f87171":"#dc2626",
            border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>
            🗑 Clear Data
          </button>
          <button onClick={() => onNavigate("workout")} style={{
            padding:"7px 20px", borderRadius:8, fontSize:13, fontWeight:700,
            background:"linear-gradient(135deg,#00d4ff,#a855f7)",
            color:"#030712", border:"none", cursor:"pointer" }}>
            Start Workout →
          </button>
        </div>
      </div>

      <div style={{ padding:"32px 28px", maxWidth:860, margin:"0 auto" }}>
        {!(data.totalWorkouts) ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:64, marginBottom:20 }}>🏋️</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, marginBottom:10 }}>
              No workouts yet!
            </div>
            <div style={{ color: dark?"#475569":"#94a3b8", marginBottom:28, fontSize:15 }}>
              Complete your first workout to see your progress here!
            </div>
            <button onClick={() => onNavigate("workout")} style={{
              padding:"12px 28px", borderRadius:10, fontWeight:700, fontSize:15,
              background:"linear-gradient(135deg,#00d4ff,#a855f7)",
              color:"#030712", border:"none", cursor:"pointer" }}>
              Start First Workout 🚀
            </button>
          </div>
        ) : (
          <Dashboard data={data} theme={theme} />
        )}
      </div>
    </div>
  );
}
