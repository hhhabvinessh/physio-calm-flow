import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SectionCard from "@/components/SectionCard";
import { Activity, Play, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const PatientHome = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Get patient record
  const { data: patient } = useQuery({
    queryKey: ["my-patient", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get exercise plans with exercise details
  const { data: plans = [] } = useQuery({
    queryKey: ["my-plans", patient?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("*, exercises(name, description)")
        .eq("patient_id", patient!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!patient,
  });

  // Get today's completions
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

  const completedPlanIds = new Set(completions.map((c) => c.exercise_plan_id));
  const completed = plans.filter((p) => completedPlanIds.has(p.id)).length;
  const progress = plans.length > 0 ? Math.round((completed / plans.length) * 100) : 0;

  const profile = user?.user_metadata;
  const displayName = profile?.full_name || patient?.full_name || "Patient";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <div className="flex items-center justify-between py-6">
          <div>
            <p className="text-muted-foreground">Good Morning,</p>
            <h1>{displayName.split(" ")[0]} 👋</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut size={18} />
          </button>
        </div>

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
                {completed} of {plans.length} exercises completed
              </p>
            </div>
          </div>
        </SectionCard>

        <h3 className="mb-3">Today's Exercises</h3>
        {plans.length === 0 ? (
          <SectionCard className="text-center py-8">
            <Activity size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No exercises assigned yet.</p>
          </SectionCard>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const done = completedPlanIds.has(plan.id);
              const exerciseName = (plan as any).exercises?.name || "Exercise";
              return (
                <SectionCard key={plan.id} hoverable onClick={() => navigate(`/patient/exercise/${plan.id}`)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          done ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Activity size={18} className={done ? "text-primary" : "text-muted-foreground"} />
                      </div>
                      <div>
                        <p className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                          {exerciseName}
                        </p>
                        <p className="text-[13px] text-muted-foreground">
                          {plan.sets} sets × {plan.reps} reps
                        </p>
                      </div>
                    </div>
                    {!done && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Play size={16} />
                      </div>
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHome;
