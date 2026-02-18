import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const PatientProgress = () => {
  const { patientId } = useParams();

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["patient-plans", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("*")
        .eq("patient_id", patientId!);
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["patient-completions", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_completions")
        .select("*")
        .eq("patient_id", patientId!);
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const { data: painLogs = [] } = useQuery({
    queryKey: ["patient-pain-logs", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pain_logs")
        .select("*")
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const completion = plans.length > 0 ? Math.round((completions.length / plans.length) * 100) : 0;
  const avgPain = painLogs.length > 0
    ? (painLogs.reduce((sum, l) => sum + l.level, 0) / painLogs.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title={patient?.full_name || "Patient Progress"} showBack />

        <SectionCard className="mb-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={`${completion * 2.64} ${100 * 2.64}`}
                  strokeLinecap="round"
                  className="animate-progress"
                />
              </svg>
              <span className="absolute text-2xl font-semibold">{completion}%</span>
            </div>
            <p className="text-muted-foreground">Overall Completion</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <div>
                <p className="text-[13px] text-muted-foreground">Exercises</p>
                <p className="text-[14px] font-medium">{plans.length} assigned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <div>
                <p className="text-[13px] text-muted-foreground">Avg. Pain</p>
                <p className="text-[14px] font-medium">{avgPain} / 10</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <h3 className="mb-3">Pain Logs</h3>
        {painLogs.length === 0 ? (
          <SectionCard className="text-center py-6">
            <p className="text-muted-foreground">No pain logs yet.</p>
          </SectionCard>
        ) : (
          <div className="space-y-3">
            {painLogs.map((log) => (
              <SectionCard key={log.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[13px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-[14px]">{log.notes || "No notes"}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-semibold text-foreground">{log.level}</span>
                    <span className="text-[11px] text-muted-foreground">/10</span>
                  </div>
                </div>
                <Progress value={log.level * 10} className="mt-2 h-1.5" />
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProgress;
