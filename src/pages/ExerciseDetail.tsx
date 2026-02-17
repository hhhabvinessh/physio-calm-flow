import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Clock, Play, Check } from "lucide-react";
import exerciseImage from "@/assets/exercise-shoulder.jpg";

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const toggleTimer = () => {
    if (running && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setRunning(false);
    } else {
      const id = setInterval(() => setTimer((t) => t + 1), 1000);
      setIntervalId(id);
      setRunning(true);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title="Straight Leg Raises" showBack />

        {/* Exercise image */}
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img
            src={exerciseImage}
            alt="Shoulder rehabilitation exercise"
            className="h-48 w-full object-cover"
          />
        </div>

        {/* Info cards */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Sets</p>
            <p className="text-xl font-semibold">3</p>
          </SectionCard>
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Reps</p>
            <p className="text-xl font-semibold">12</p>
          </SectionCard>
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Rest</p>
            <p className="text-xl font-semibold">30s</p>
          </SectionCard>
        </div>

        {/* Timer */}
        <SectionCard className="mb-6 text-center">
          <div className="flex flex-col items-center gap-3 py-4">
            <Clock size={20} className="text-muted-foreground" />
            <p className="font-mono text-4xl font-bold text-foreground">{formatTime(timer)}</p>
            <PrimaryButton fullWidth={false} className="px-8" onClick={toggleTimer}>
              {running ? "Pause" : "Start"}
              {!running && <Play size={16} className="ml-1" />}
            </PrimaryButton>
          </div>
        </SectionCard>

        <PrimaryButton onClick={() => navigate("/patient/completion")}>
          <Check size={18} className="mr-2" />
          Mark as Completed
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ExerciseDetail;
