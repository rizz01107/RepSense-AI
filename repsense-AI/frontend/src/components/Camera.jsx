import { useEffect, useRef } from "react";

export default function Camera({ videoRef, annotatedFrame, angles, active, theme }) {
  const dark   = theme === "dark";
  const imgRef = useRef(null);

  useEffect(() => {
    if (annotatedFrame && imgRef.current)
      imgRef.current.src = `data:image/jpeg;base64,${annotatedFrame}`;
  }, [annotatedFrame]);

  return (
    <div style={{ position:"relative", borderRadius:16, overflow:"hidden",
      background:"#000", aspectRatio:"4/3",
      border:`1px solid ${dark?"rgba(255,255,255,0.08)":"#e2e8f0"}` }}>

      <video ref={videoRef} muted playsInline
        style={{ width:"100%", height:"100%", objectFit:"cover",
          transform:"scaleX(-1)", display: annotatedFrame ? "none" : "block" }} />

      {annotatedFrame && (
        <img ref={imgRef} alt="pose"
          style={{ width:"100%", height:"100%", objectFit:"cover",
            transform:"scaleX(-1)", display:"block" }} />
      )}

      {!active && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:12,
          background: dark?"rgba(3,7,18,0.88)":"rgba(248,250,252,0.92)" }}>
          <div style={{ fontSize:60, opacity:0.35 }}>📷</div>
          <div style={{ fontSize:16, fontWeight:600, color: dark?"#94a3b8":"#64748b" }}>
            Camera not started
          </div>
          <div style={{ fontSize:13, color: dark?"#475569":"#94a3b8" }}>
            Click "Start Camera" above to begin
          </div>
        </div>
      )}

      {active && (
        <div style={{ position:"absolute", top:12, left:12,
          display:"flex", alignItems:"center", gap:6, padding:"5px 12px",
          borderRadius:20, backdropFilter:"blur(12px)",
          background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,255,255,0.1)",
          fontSize:12, fontWeight:700, color:"#fff" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e",
            animation:"blink 1.4s infinite", display:"inline-block" }}/>
          LIVE
        </div>
      )}

      {active && angles && Object.keys(angles).length > 0 && (
        <div style={{ position:"absolute", bottom:12, left:"50%",
          transform:"translateX(-50%)", display:"flex", gap:8, flexWrap:"wrap",
          justifyContent:"center" }}>
          {["knee","hip","back","elbow"].map(k => angles[k] != null && (
            <div key={k} style={{ padding:"4px 12px", borderRadius:8, fontSize:12,
              fontWeight:600, backdropFilter:"blur(12px)",
              background:"rgba(0,0,0,0.65)", border:"1px solid rgba(255,255,255,0.1)",
              color:"#e2e8f0" }}>
              {k}: <span style={{color:"#00d4ff"}}>{Math.round(angles[k])}°</span>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
