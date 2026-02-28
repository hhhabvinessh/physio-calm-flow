import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PrimaryButton from "@/components/PrimaryButton";
import { CheckCircle2 } from "lucide-react";

const CompletionScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const { data: plans = [] } = useQuery({
    queryKey: ["my-plans", patient?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("id")
        .eq("patient_id", patient!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!patient,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["my-completions-today", patient?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("exercise_completions")
        .select("exercise_plan_id")
        .eq("patient_id", patient!.id)
        .gte("completed_at", today);
      if (error) throw error;
      return data;
    },
    enabled: !!patient,
  });

  const completedIds = new Set(completions.map((c) => c.exercise_plan_id));
  const completed = plans.filter((p) => completedIds.has(p.id)).length;
  const progress = plans.length > 0 ? Math.round((completed / plans.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container flex min-h-screen flex-col items-center justify-center gap-8 pb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div className="text-center">
            <h1 className="mb-2">Session Completed!</h1>
            <p className="text-muted-foreground">Great work! Keep it up.</p>
          </div>
        </div>

        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={`${progress * 2.64} ${100 * 2.64}`}
              strokeLinecap="round"
              className="animate-progress"
            />
          </svg>
          <span className="absolute text-2xl font-bold">{progress}%</span>
        </div>
        <p className="text-muted-foreground">
          {completed} of {plans.length} exercises completed today
        </p>

        <div className="w-full space-y-3">
          <PrimaryButton onClick={() => navigate("/patient/pain-log")}>Log Pain Level</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => navigate("/patient/home")}>
            Return Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
