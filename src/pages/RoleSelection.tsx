import { Stethoscope, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PrimaryButton from "@/components/PrimaryButton";
import heroImage from "@/assets/hero-physio.jpg";
import { useEffect } from "react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  // Redirect if already logged in with a role
  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/home", { replace: true });
    }
  }, [user, role, loading, navigate]);

  // If logged in but no role, redirect to role assignment page
  useEffect(() => {
    if (!loading && user && !role) {
      navigate("/select-role", { replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background page-transition">
      <div className="app-container flex flex-1 flex-col items-center justify-center gap-8 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Heart className="text-primary-foreground" size={28} />
          </div>
          <div className="text-center">
            <h1 className="mb-2">Welcome to PhysioCare</h1>
            <p className="text-muted-foreground">Your path to recovery starts here</p>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt="Physiotherapy session in a bright clinic"
            className="h-48 w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col gap-4">
          <PrimaryButton onClick={() => navigate("/login?role=doctor")}>
            <Stethoscope size={20} className="mr-2" />
            I am a Doctor
          </PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => navigate("/login?role=patient")}>
            <Heart size={20} className="mr-2" />
            I am a Patient
          </PrimaryButton>
        </div>

        <p className="text-[13px] text-muted-foreground">
          Trusted by 500+ clinics worldwide
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
