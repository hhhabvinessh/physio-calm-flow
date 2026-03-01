import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!loading && user && role) {
      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (role === "patient") {
        navigate("/patient/home", { replace: true });
      }
      return;
    }

    // Not logged in, redirect to login
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, role, loading, navigate]);

  // Show loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default RoleSelection;
