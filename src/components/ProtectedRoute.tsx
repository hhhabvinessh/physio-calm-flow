import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "doctor" | "patient";
}

// ✅ ROUTE PROTECTION WITH ROLE-BASED ACCESS CONTROL (RBAC)
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control (server-side validation already done in AuthContext)
  if (requiredRole && role !== requiredRole) {
    // User has wrong role - redirect to their dashboard
    if (role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (role === "patient") {
      return <Navigate to="/patient/home" replace />;
    }
    // Fallback - redirect to login
    return <Navigate to="/login" replace />;
  }

  // ✅ ALL CHECKS PASSED - RENDER PROTECTED CONTENT
  return <>{children}</>;
};

export default ProtectedRoute;
