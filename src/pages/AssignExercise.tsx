import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Plus, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface AssignedExercise {
  exercise_id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

const AssignExercise = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientId } = useParams();
  const [assigned, setAssigned] = useState<AssignedExercise[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addExercise = (ex: { id: string; name: string }) => {
    if (!assigned.find((a) => a.exercise_id === ex.id)) {
      setAssigned([...assigned, { exercise_id: ex.id, name: ex.name, sets: "3", reps: "12", rest: "30" }]);
    }
  };

  const updateField = (exerciseId: string, field: string, value: string) => {
    setAssigned(assigned.map((a) => (a.exercise_id === exerciseId ? { ...a, [field]: value } : a)));
  };

  const handleSave = async () => {
    if (!patientId || assigned.length === 0 || !user) return;
    setSaving(true);
    try {
      const plans = assigned.map((a) => ({
        patient_id: patientId,
        exercise_id: a.exercise_id,
        sets: parseInt(a.sets) || 3,
        reps: parseInt(a.reps) || 12,
        rest_seconds: parseInt(a.rest) || 30,
        assigned_by: user.id,
      }));
      const { error } = await supabase.from("exercise_plans").insert(plans);
      if (error) {
        toast.error("Failed to save plan");
        console.error(error);
        return;
      }
      toast.success("Exercise plan saved!");
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error("Save plan error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-24">
        <PageHeader title="Assign Exercises" showBack />

        <div className="space-y-3">
          {exercises.map((ex) => {
            const isAdded = assigned.find((a) => a.exercise_id === ex.id);
            return (
              <SectionCard key={ex.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Activity size={16} className="text-primary" />
                    </div>
                    <p className="font-medium">{ex.name}</p>
                  </div>
                  {!isAdded ? (
                    <button
                      onClick={() => addExercise(ex)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    <span className="text-[13px] font-medium text-primary">Added</span>
                  )}
                </div>
                {isAdded && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Sets</label>
                      <Input
                        value={isAdded.sets}
                        onChange={(e) => updateField(ex.id, "sets", e.target.value)}
                        className="h-9 rounded-lg text-center text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Reps</label>
                      <Input
                        value={isAdded.reps}
                        onChange={(e) => updateField(ex.id, "reps", e.target.value)}
                        className="h-9 rounded-lg text-center text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Rest (s)</label>
                      <Input
                        value={isAdded.rest}
                        onChange={(e) => updateField(ex.id, "rest", e.target.value)}
                        className="h-9 rounded-lg text-center text-[13px]"
                      />
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>
      </div>

      {assigned.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="app-container">
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : `Save Plan (${assigned.length} exercises)`}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignExercise;
