import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DoctorDashboard from "./pages/DoctorDashboard";
import AddPatient from "./pages/AddPatient";
import AssignExercise from "./pages/AssignExercise";
import PatientProgress from "./pages/PatientProgress";
import Subscription from "./pages/Subscription";
import PatientHome from "./pages/PatientHome";
import ExerciseDetail from "./pages/ExerciseDetail";
import PainLog from "./pages/PainLog";
import CompletionScreen from "./pages/CompletionScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Auto-redirect authenticated users away from public pages
  const publicPaths = ["/", "/login", "/signup"];
  if (user && role && publicPaths.includes(location.pathname)) {
    const redirect = role === "doctor" ? "/doctor/dashboard" : "/patient/home";
    return <Navigate to={redirect} replace />;
  }

  // Authenticated user without a role — block access
  if (user && !role && !publicPaths.includes(location.pathname)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">Your account does not have a valid role assigned. Please contact support.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/add-patient" element={<ProtectedRoute requiredRole="doctor"><AddPatient /></ProtectedRoute>} />
      <Route path="/doctor/assign-exercise/:patientId" element={<ProtectedRoute requiredRole="doctor"><AssignExercise /></ProtectedRoute>} />
      <Route path="/doctor/patient-progress/:patientId" element={<ProtectedRoute requiredRole="doctor"><PatientProgress /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/patient/home" element={<ProtectedRoute requiredRole="patient"><PatientHome /></ProtectedRoute>} />
      <Route path="/patient/exercise/:planId" element={<ProtectedRoute requiredRole="patient"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="/patient/pain-log" element={<ProtectedRoute requiredRole="patient"><PainLog /></ProtectedRoute>} />
      <Route path="/patient/completion" element={<ProtectedRoute requiredRole="patient"><CompletionScreen /></ProtectedRoute>} />
      {/* Keep old routes for backwards compat */}
      <Route path="/doctor/assign-exercise" element={<ProtectedRoute requiredRole="doctor"><AssignExercise /></ProtectedRoute>} />
      <Route path="/doctor/patient-progress" element={<ProtectedRoute requiredRole="doctor"><PatientProgress /></ProtectedRoute>} />
      <Route path="/patient/exercise" element={<ProtectedRoute requiredRole="patient"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
