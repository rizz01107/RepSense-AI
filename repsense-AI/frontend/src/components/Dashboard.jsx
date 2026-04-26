import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const EMOJIS = {"Squat":"🏋️","Push-up":"💪","Deadlift":"🔱","Bicep Curl":"💎",
  "Lunge":"🦵","Plank":"🧘","Shoulder Press":"🏆","Burpee":"🔥"};

export default function Dashboard({ data, theme }) {
  const dark   = theme === "dark";
  const card   = dark ? "rgba(15,22,41,0.6)" : "#fff";
  const bdr    = dark ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const sub    = dark ? "#475569" : "#94a3b8";
  const today  = new Date().getDay();
  const weekly = (data.weeklyData || Array(7).fill(0)).map((v,i) => ({ day:DAYS[i], reps:v }));
  const recent = (data.history || []).slice(-5).reverse();

  const cs = { background:card, border:`1px solid ${bdr}`, borderRadius:16, padding:24 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { label:"Total Reps",  val:data.totalReps||0,   color:"#00d4ff" },
          { label:"Workouts",    val:data.totalWorkouts||0,color:"#a855f7" },
          { label:"Best Form",   val:data.bestForm?`${data.bestForm}%`:"--", color:"#00ff88" },
        ].map(s => (
          <div key={s.label} style={{ ...cs, textAlign:"center", padding:18 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30,
              fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:sub, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={cs}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
          color: dark?"#f8fafc":"#0f172a", marginBottom:16 }}>📅 Weekly Reps</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekly} margin={{ top:0, bottom:0, left:-30, right:0 }}>
            <XAxis dataKey="day" tick={{ fill:sub, fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:sub, fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: dark?"#0a1628":"#fff",
              border:`1px solid ${bdr}`, borderRadius:8, fontSize:12,
              color: dark?"#f8fafc":"#0f172a" }}
              cursor={{ fill: dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)" }}/>
            <Bar dataKey="reps" radius={[4,4,0,0]}>
              {weekly.map((_,i) => (
                <Cell key={i} fill={i===today?"#00d4ff":(dark?"#1e3a5f":"#bae6fd")}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {recent.length > 0 && (
        <div style={cs}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
            color: dark?"#f8fafc":"#0f172a", marginBottom:14 }}>🕐 Recent Sessions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {recent.map((h,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"10px 14px", borderRadius:10,
                background: dark?"rgba(255,255,255,0.02)":"#f8fafc",
                border:`1px solid ${dark?"rgba(255,255,255,0.05)":"#f1f5f9"}` }}>
                <span style={{ fontSize:22 }}>{EMOJIS[h.exercise]||"💪"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color: dark?"#f8fafc":"#0f172a" }}>
                    {h.exercise}
                  </div>
                  <div style={{ fontSize:12, color:sub }}>
                    {h.reps} reps · {h.date}
                  </div>
                </div>
                {h.formScore && (
                  <div style={{ padding:"3px 10px", borderRadius:8, fontSize:12, fontWeight:600,
                    background: dark?"rgba(0,255,136,0.1)":"#d1fae5",
                    color: dark?"#6ee7b7":"#059669" }}>
                    {h.formScore}% form
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
