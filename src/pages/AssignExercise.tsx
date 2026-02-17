import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Plus, Activity } from "lucide-react";

const exerciseLibrary = [
  { id: 1, name: "Straight Leg Raises" },
  { id: 2, name: "Wall Squats" },
  { id: 3, name: "Hamstring Curls" },
  { id: 4, name: "Calf Stretches" },
  { id: 5, name: "Quad Sets" },
  { id: 6, name: "Shoulder Pendulums" },
];

interface AssignedExercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

const AssignExercise = () => {
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState<AssignedExercise[]>([]);

  const addExercise = (ex: { id: number; name: string }) => {
    if (!assigned.find((a) => a.id === ex.id)) {
      setAssigned([...assigned, { ...ex, sets: "3", reps: "12", rest: "30" }]);
    }
  };

  const updateField = (id: number, field: string, value: string) => {
    setAssigned(assigned.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-24">
        <PageHeader title="Assign Exercises" showBack />

        <div className="space-y-3">
          {exerciseLibrary.map((ex) => {
            const isAdded = assigned.find((a) => a.id === ex.id);
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
            <PrimaryButton onClick={() => navigate("/doctor/dashboard")}>
              Save Plan ({assigned.length} exercises)
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignExercise;
