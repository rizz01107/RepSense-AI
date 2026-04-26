import { useEffect, useRef } from "react";

export default function RepCounter({ count, target, phase, score, theme, isfast }) {
  const dark    = theme === "dark";
  const pct     = Math.min(count / Math.max(target, 1), 1);
  const numRef  = useRef(null);
  const prevRef = useRef(count);

  useEffect(() => {
    if (count > prevRef.current && numRef.current) {
      numRef.current.style.transform = "scale(1.4)";
      numRef.current.style.color     = dark ? "#00ff88" : "#059669";
      setTimeout(() => {
        if (numRef.current) {
          numRef.current.style.transform = "scale(1)";
          numRef.current.style.color     = dark ? "#00d4ff" : "#0ea5e9";
        }
      }, 280);
    }
    prevRef.current = count;
  }, [count, dark]);

  const scoreColor = score >= 85 ? (dark?"#00ff88":"#059669")
                   : score >= 65 ? (dark?"#fbbf24":"#d97706")
                   : (dark?"#f87171":"#dc2626");

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", width:140, height:140, margin:"0 auto 16px" }}>
        <svg width="140" height="140" style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
          <circle cx="70" cy="70" r="60" fill="none"
            stroke={dark?"rgba(255,255,255,0.06)":"#e2e8f0"} strokeWidth="10"/>
          <circle cx="70" cy="70" r="60" fill="none"
            stroke={dark?"#00d4ff":"#0ea5e9"} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${2*Math.PI*60}`}
            strokeDashoffset={`${2*Math.PI*60*(1-pct)}`}
            style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div ref={numRef} style={{ fontFamily:"'Syne',sans-serif", fontSize:46,
            fontWeight:800, color: dark?"#00d4ff":"#0ea5e9",
            transition:"transform 0.15s, color 0.15s", lineHeight:1 }}>{count}</div>
          <div style={{ fontSize:12, color: dark?"#475569":"#94a3b8", marginTop:2 }}>/ {target}</div>
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, color: dark?"#94a3b8":"#64748b",
        letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>REPS</div>

      <div style={{ display:"inline-block", padding:"7px 20px", borderRadius:20,
        fontSize:13, fontWeight:600, marginBottom:16,
        background: phase==="down"
          ? (dark?"rgba(0,212,255,0.12)":"#dbeafe")
          : (dark?"rgba(0,255,136,0.1)":"#d1fae5"),
        color: phase==="down"
          ? (dark?"#00d4ff":"#2563eb")
          : (dark?"#00ff88":"#059669"),
        border:`1px solid ${phase==="down"
          ? (dark?"rgba(0,212,255,0.2)":"#bfdbfe")
          : (dark?"rgba(0,255,136,0.2)":"#a7f3d0")}` }}>
        {phase==="down" ? "⬇ Going Down" : "⬆ Coming Up"}
      </div>

      {isfast && (
        <div style={{ padding:"6px 14px", borderRadius:10, fontSize:12, fontWeight:600,
          background: dark?"rgba(249,115,22,0.1)":"#fff7ed",
          color: dark?"#fb923c":"#ea580c",
          border:`1px solid ${dark?"rgba(249,115,22,0.2)":"#fed7aa"}`,
          marginBottom:12 }}>
          ⚡ Slow down — control beats speed!
        </div>
      )}

      <div style={{ padding:"0 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
          <span style={{ color: dark?"#64748b":"#94a3b8" }}>Form Score</span>
          <span style={{ color:scoreColor, fontWeight:700 }}>{score}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, overflow:"hidden",
          background: dark?"rgba(255,255,255,0.06)":"#e2e8f0" }}>
          <div style={{ height:"100%", borderRadius:3, width:`${score}%`,
            background:`linear-gradient(90deg,${scoreColor},${dark?"#00d4ff":"#38bdf8"})`,
            transition:"width 0.6s ease" }}/>
        </div>
      </div>
    </div>
  );
}
