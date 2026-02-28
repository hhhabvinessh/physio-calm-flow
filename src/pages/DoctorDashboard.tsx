import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["doctor-patients", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Batch fetch completion stats — single query per table instead of N+1
  const patientIds = patients.map((p) => p.id);

  const { data: planCounts = {} } = useQuery({
    queryKey: ["plan-counts", patientIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_plans")
        .select("patient_id")
        .in("patient_id", patientIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.patient_id] = (counts[row.patient_id] || 0) + 1;
      });
      return counts;
    },
    enabled: patientIds.length > 0,
  });

  const { data: completionCounts = {} } = useQuery({
    queryKey: ["completion-counts", patientIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_completions")
        .select("patient_id")
        .in("patient_id", patientIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.patient_id] = (counts[row.patient_id] || 0) + 1;
      });
      return counts;
    },
    enabled: patientIds.length > 0,
  });

  const getCompletion = (patientId: string) => {
    const plans = planCounts[patientId] || 0;
    const completed = completionCounts[patientId] || 0;
    return plans > 0 ? Math.round((completed / plans) * 100) : 0;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader
          title="Dashboard"
          rightAction={
            <div className="flex items-center gap-2">
              <PrimaryButton
                fullWidth={false}
                onClick={() => navigate("/doctor/add-patient")}
                className="h-10 px-4"
              >
                <Plus size={18} className="mr-1" />
                Add Patient
              </PrimaryButton>
              <button
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : patients.length === 0 ? (
          <SectionCard className="text-center py-12">
            <User size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No patients yet. Add your first patient!</p>
          </SectionCard>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => {
              const completion = getCompletion(patient.id);
              return (
                <SectionCard
                  key={patient.id}
                  hoverable
                  onClick={() => navigate(`/doctor/patient-progress/${patient.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <User size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{patient.full_name}</p>
                          <p className="text-[13px] text-muted-foreground">{patient.diagnosis || "No diagnosis"}</p>
                        </div>
                        <Badge
                          variant={patient.is_active ? "default" : "secondary"}
                          className={
                            patient.is_active
                              ? "bg-primary/10 text-primary hover:bg-primary/10"
                              : "bg-muted text-muted-foreground hover:bg-muted"
                          }
                        >
                          {patient.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={completion} className="h-2 flex-1" />
                        <span className="text-[13px] font-medium text-muted-foreground">
                          {completion}%
                        </span>
                      </div>
                    </div>
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

export default DoctorDashboard;
