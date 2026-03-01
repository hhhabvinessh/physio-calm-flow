import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Smartphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 2 seconds
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container flex min-h-screen flex-col">
        <PageHeader title="" showBack />

        <div className="flex flex-1 flex-col justify-center gap-8 pb-12">
          {/* ✅ HEADER */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <AlertCircle className="text-blue-600" size={24} />
            </div>
            <div className="text-center">
              <h1 className="mb-1">Registration Closed</h1>
              <p className="text-muted-foreground">
                Public sign-up is not available
              </p>
            </div>
          </div>

          {/* ✅ MESSAGE */}
          <div className="flex flex-col gap-4 bg-accent/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <Smartphone className="text-muted-foreground mt-1 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-medium mb-1">How to Register</p>
                <p className="text-sm text-muted-foreground">
                  New users must be registered by their clinic or healthcare provider. 
                  Please contact your clinic to be added to the PhysioCare system.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ BUTTON */}
          <div className="flex flex-col gap-3">
            <PrimaryButton 
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to Login
            </PrimaryButton>
            <p className="text-center text-xs text-muted-foreground">
              Redirecting in a moment...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
