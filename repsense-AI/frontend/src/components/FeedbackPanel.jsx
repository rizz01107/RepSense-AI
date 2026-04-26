import { useEffect, useRef } from "react";

export default function FeedbackPanel({ messages, isLoading, theme }) {
  const dark = theme === "dark";
  const endRef = useRef(null);
  const lastSpokenRef = useRef(""); // Duplicate messages ko bar bar bolne se rokne ke liye

  // --- Voice Engine Logic ---
  const speak = (text) => {
    if (!text || text === lastSpokenRef.current) return;
    
    // Purani voice ko foran cancel karo takay naya feedback delay na ho
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice settings
    utterance.lang = "en-US"; 
    utterance.rate = 1.0;   // Normal speed
    utterance.pitch = 1.0;  // Normal tone
    
    window.speechSynthesis.speak(utterance);
    lastSpokenRef.current = text;
  };

  useEffect(() => {
    // 1. Auto-scroll logic
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // 2. Voice feedback logic
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1].text;
      speak(latestMessage);
    }
  }, [messages]);

  const styles = {
    good:    { bg: dark ? "rgba(0,255,136,0.08)" : "#d1fae5", br: dark ? "rgba(0,255,136,0.2)" : "#6ee7b7", c: dark ? "#6ee7b7" : "#065f46" },
    warning: { bg: dark ? "rgba(251,191,36,0.08)" : "#fef3c7", br: dark ? "rgba(251,191,36,0.2)" : "#fcd34d", c: dark ? "#fde68a" : "#78350f" },
    error:   { bg: dark ? "rgba(239,68,68,0.1)" : "#fee2e2",   br: dark ? "rgba(239,68,68,0.2)" : "#fca5a5", c: dark ? "#fca5a5" : "#7f1d1d" },
    ai:      { bg: dark ? "rgba(0,212,255,0.08)" : "#e0f2fe", br: dark ? "rgba(0,212,255,0.15)" : "#7dd3fc", c: dark ? "#f0f9ff" : "#0c4a6e" },
  };

  return (
    <div style={{ 
      background: dark ? "rgba(15,22,41,0.6)" : "#fff",
      border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 
    }}>

      {/* Header section */}
      <div style={{ 
        display: "flex", alignItems: "center", gap: 10,
        paddingBottom: 14, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` 
      }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg,#00d4ff,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: dark ? "#f8fafc" : "#0f172a" }}>AI Coach</div>
          <div style={{ fontSize: 12, color: dark ? "#475569" : "#94a3b8" }}>Real-time feedback</div>
        </div>
        {isLoading && (
          <div style={{ 
            marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
            border: `2px solid ${dark ? "rgba(0,212,255,0.2)" : "#bae6fd"}`,
            borderTopColor: dark ? "#00d4ff" : "#0ea5e9",
            animation: "spin 0.7s linear infinite" 
          }}/>
        )}
      </div>

      {/* Messages container */}
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ color: dark ? "#334155" : "#cbd5e1", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
            Start your workout to receive coaching!
          </div>
        )}
        {messages.map((m, i) => {
          const s = styles[m.type] || styles.ai;
          return (
            <div key={i} style={{ 
              padding: "10px 14px", borderRadius: 12, fontSize: 13,
              lineHeight: 1.65, background: s.bg, border: `1px solid ${s.br}`, color: s.c,
              animation: "slideUp 0.3s ease" 
            }}>
              {m.text}
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}