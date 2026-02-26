import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PrimaryButton from "@/components/PrimaryButton";
import { Stethoscope, Heart } from "lucide-react";
import { toast } from "sonner";

const SelectRole = () => {
  const navigate = useNavigate();
  const { user, role, loading, refreshRole } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // If already has role, redirect
  if (!loading && user && role) {
    navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/home", { replace: true });
    return null;
  }

  // If not logged in, redirect to home
  if (!loading && !user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSelectRole = async (selectedRole: "doctor" | "patient") => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role: selectedRole,
    });
    if (error) {
      toast.error("Failed to set role. Please try again.");
      setSubmitting(false);
      return;
    }
    await refreshRole();
    navigate(selectedRole === "doctor" ? "/doctor/dashboard" : "/patient/home", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background page-transition">
      <div className="app-container flex flex-1 flex-col items-center justify-center gap-8 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Heart className="text-primary-foreground" size={28} />
          </div>
          <div className="text-center">
            <h1 className="mb-2">Choose Your Role</h1>
            <p className="text-muted-foreground">How will you use PhysioCare?</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <PrimaryButton onClick={() => handleSelectRole("doctor")} disabled={submitting}>
            <Stethoscope size={20} className="mr-2" />
            I am a Doctor
          </PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => handleSelectRole("patient")} disabled={submitting}>
            <Heart size={20} className="mr-2" />
            I am a Patient
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
