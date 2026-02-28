import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Clock, Play, Pause, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import exerciseImage from "@/assets/exercise-shoulder.jpg";

const ExerciseDetail = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Timer with proper cleanup
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const { data: plan } = useQuery({
    queryKey: ["exercise-plan", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("*, exercises(name, description)")
        .eq("id", planId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const { data: patient } = useQuery({
    queryKey: ["my-patient", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleTimer = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleComplete = async () => {
    if (!planId || !patient) return;
    setCompleting(true);
    try {
      const { error } = await supabase.from("exercise_completions").insert({
        exercise_plan_id: planId,
        patient_id: patient.id,
      });
      if (error) {
        toast.error("Failed to mark complete");
        console.error(error);
        return;
      }
      setRunning(false);
      queryClient.invalidateQueries({ queryKey: ["my-completions-today"] });
      navigate("/patient/completion");
    } catch (err) {
      console.error("Completion error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setCompleting(false);
    }
  };

  const exerciseName = (plan as any)?.exercises?.name || "Exercise";

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title={exerciseName} showBack />

        <div className="mb-6 overflow-hidden rounded-2xl">
          <img src={exerciseImage} alt="Exercise demonstration" className="h-48 w-full object-cover" />
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Sets</p>
            <p className="text-xl font-semibold">{plan?.sets || 3}</p>
          </SectionCard>
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Reps</p>
            <p className="text-xl font-semibold">{plan?.reps || 12}</p>
          </SectionCard>
          <SectionCard className="text-center">
            <p className="text-[11px] text-muted-foreground">Rest</p>
            <p className="text-xl font-semibold">{plan?.rest_seconds || 30}s</p>
          </SectionCard>
        </div>

        <SectionCard className="mb-6 text-center">
          <div className="flex flex-col items-center gap-3 py-4">
            <Clock size={20} className="text-muted-foreground" />
            <p className="font-mono text-4xl font-bold text-foreground">{formatTime(timer)}</p>
            <PrimaryButton fullWidth={false} className="px-8" onClick={toggleTimer}>
              {running ? "Pause" : "Start"}
              {running ? <Pause size={16} className="ml-1" /> : <Play size={16} className="ml-1" />}
            </PrimaryButton>
          </div>
        </SectionCard>

        <PrimaryButton onClick={handleComplete} disabled={completing}>
          <Check size={18} className="mr-2" />
          {completing ? "Saving..." : "Mark as Completed"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ExerciseDetail;
