import { useState, useEffect } from "react";
import Home     from "./pages/Home";
import Workout  from "./pages/Workout";
import Progress from "./pages/Progress";

export default function App() {
  const [page,     setPage]     = useState("home");
  const [exercise, setExercise] = useState("Squat");
  const [language, setLanguage] = useState("en");
  const [theme,    setTheme]    = useState(() => localStorage.getItem("rs_theme") || "dark");
  const [data,     setData]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("repsense_data") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    document.body.style.background = theme === "dark" ? "#030712" : "#f8fafc";
    document.body.style.color      = theme === "dark" ? "#f8fafc" : "#0f172a";
    localStorage.setItem("rs_theme", theme);
  }, [theme]);

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const saveWorkout = (reps, ex, duration, formScore) => {
    if (!reps) return;
    const updated = {
      totalReps:     (data.totalReps     || 0) + reps,
      totalWorkouts: (data.totalWorkouts || 0) + 1,
      bestForm:      Math.max(data.bestForm || 0, formScore || 0),
      weeklyData:    (data.weeklyData || Array(7).fill(0)).map((v,i) =>
        i === new Date().getDay() ? v + reps : v),
      history: [...(data.history||[]),
        { exercise:ex, reps, duration, formScore,
          date: new Date().toLocaleDateString(), timestamp: Date.now() }
      ].slice(-30),
    };
    setData(updated);
    localStorage.setItem("repsense_data", JSON.stringify(updated));
  };

  const common = { theme, language, onNavigate: navigate };

  return (
    <div style={{ minHeight:"100vh" }}>
      {page === "home" &&
        <Home {...common}
          onLangChange={setLanguage}
          onThemeToggle={toggleTheme}
          onSelectExercise={ex => { setExercise(ex); navigate("workout"); }}
          stats={data}
        />
      }
      {page === "workout" &&
        <Workout {...common} exercise={exercise} onWorkoutComplete={saveWorkout} />
      }
      {page === "progress" &&
        <Progress {...common} data={data} />
      }
    </div>
  );
}
