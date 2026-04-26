import { useState } from "react";

const EX = [
  { name:"Squat",           emoji:"🏋️", level:"Beginner",     muscles:"Quads · Glutes · Core" },
  { name:"Push-up",         emoji:"💪", level:"Beginner",     muscles:"Chest · Triceps · Core" },
  { name:"Deadlift",        emoji:"🔱", level:"Intermediate", muscles:"Back · Glutes · Hamstrings" },
  { name:"Bicep Curl",      emoji:"💎", level:"Beginner",     muscles:"Biceps" },
  { name:"Lunge",           emoji:"🦵", level:"Beginner",     muscles:"Quads · Glutes · Balance" },
  { name:"Plank",           emoji:"🧘", level:"Beginner",     muscles:"Core · Shoulders" },
  { name:"Shoulder Press",  emoji:"🏆", level:"Intermediate", muscles:"Shoulders · Triceps" },
  { name:"Jumping Jack",    emoji:"⭐", level:"Beginner",     muscles:"Full Body · Cardio" },
  { name:"Mountain Climber",emoji:"🏔️", level:"Intermediate", muscles:"Core · Cardio" },
  { name:"Burpee",          emoji:"🔥", level:"Advanced",     muscles:"Full Body · Cardio" },
];

const LC = {
  Beginner:     { dark:"#052e16", accent:"#059669" },
  Intermediate: { dark:"#0c1a3a", accent:"#2563eb" },
  Advanced:     { dark:"#3b0000", accent:"#dc2626" },
};

export default function ExerciseSelect({ selected, onSelect, theme }) {
  const dark = theme === "dark";
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? EX : EX.filter(e => e.level === filter);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {["All","Beginner","Intermediate","Advanced"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:600,
            cursor:"pointer", border:"none", transition:"all 0.2s",
            background: filter===f ? (dark?"#00d4ff":"#0ea5e9") : (dark?"rgba(255,255,255,0.06)":"#f1f5f9"),
            color: filter===f ? "#030712" : (dark?"#94a3b8":"#64748b"),
          }}>{f}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12 }}>
        {list.map(ex => {
          const sel = selected === ex.name;
          const lc  = LC[ex.level];
          return (
            <div key={ex.name} onClick={() => onSelect(ex.name)} style={{
              padding:"20px 14px", borderRadius:14, cursor:"pointer",
              textAlign:"center", transition:"all 0.25s",
              background: dark ? (sel?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.04)")
                               : (sel?"#e0f2fe":"#f8fafc"),
              border: sel
                ? `2px solid ${dark?"#00d4ff":"#0ea5e9"}`
                : `1px solid ${dark?"rgba(255,255,255,0.08)":"#e2e8f0"}`,
              transform: sel ? "scale(1.04)" : "scale(1)",
              boxShadow: sel ? `0 0 20px ${dark?"rgba(0,212,255,0.2)":"rgba(14,165,233,0.15)"}` : "none",
            }}>
              <div style={{ fontSize:36, marginBottom:10 }}>{ex.emoji}</div>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:6,
                color: dark?"#f8fafc":"#0f172a" }}>{ex.name}</div>
              <div style={{ display:"inline-block", padding:"2px 10px", borderRadius:10,
                fontSize:11, fontWeight:600, marginBottom:5,
                background: dark ? lc.dark : "#f0fdf4", color: lc.accent }}>
                {ex.level}
              </div>
              <div style={{ fontSize:11, color: dark?"#64748b":"#94a3b8", marginTop:4 }}>
                {ex.muscles}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
