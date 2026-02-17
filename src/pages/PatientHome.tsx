import { useNavigate } from "react-router-dom";
import SectionCard from "@/components/SectionCard";
import { Activity, Play } from "lucide-react";

const exercises = [
  { id: 1, name: "Straight Leg Raises", sets: 3, reps: 12, done: false },
  { id: 2, name: "Wall Squats", sets: 3, reps: 10, done: true },
  { id: 3, name: "Hamstring Curls", sets: 3, reps: 15, done: false },
  { id: 4, name: "Calf Stretches", sets: 2, reps: 20, done: false },
];

const PatientHome = () => {
  const navigate = useNavigate();
  const completed = exercises.filter((e) => e.done).length;
  const progress = Math.round((completed / exercises.length) * 100);

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        {/* Greeting */}
        <div className="py-6">
          <p className="text-muted-foreground">Good Morning,</p>
          <h1>John 👋</h1>
        </div>

        {/* Progress circle */}
        <SectionCard className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="10"
                  strokeDasharray={`${progress * 2.64} ${100 * 2.64}`}
                  strokeLinecap="round"
                  className="animate-progress"
                />
              </svg>
              <span className="absolute text-sm font-semibold">{progress}%</span>
            </div>
            <div>
              <p className="font-medium">Today's Progress</p>
              <p className="text-[13px] text-muted-foreground">
                {completed} of {exercises.length} exercises completed
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Exercise list */}
        <h3 className="mb-3">Today's Exercises</h3>
        <div className="space-y-3">
          {exercises.map((ex) => (
            <SectionCard key={ex.id} hoverable onClick={() => navigate("/patient/exercise")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      ex.done ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Activity size={18} className={ex.done ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div>
                    <p className={`font-medium ${ex.done ? "text-muted-foreground line-through" : ""}`}>
                      {ex.name}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {ex.sets} sets × {ex.reps} reps
                    </p>
                  </div>
                </div>
                {!ex.done && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Play size={16} />
                  </div>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
