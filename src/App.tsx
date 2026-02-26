import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SelectRole from "./pages/SelectRole";
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const publicPaths = ["/", "/login", "/signup", "/select-role"];
  if (user && role && ["/", "/login", "/signup"].includes(location.pathname)) {
    const redirect = role === "doctor" ? "/doctor/dashboard" : "/patient/home";
    return <Navigate to={redirect} replace />;
  }

  if (user && !role && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/select-role" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/select-role" element={<SelectRole />} />
      <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/add-patient" element={<ProtectedRoute requiredRole="doctor"><AddPatient /></ProtectedRoute>} />
      <Route path="/doctor/assign-exercise/:patientId" element={<ProtectedRoute requiredRole="doctor"><AssignExercise /></ProtectedRoute>} />
      <Route path="/doctor/patient-progress/:patientId" element={<ProtectedRoute requiredRole="doctor"><PatientProgress /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/patient/home" element={<ProtectedRoute requiredRole="patient"><PatientHome /></ProtectedRoute>} />
      <Route path="/patient/exercise/:planId" element={<ProtectedRoute requiredRole="patient"><ExerciseDetail /></ProtectedRoute>} />
      <Route path="/patient/pain-log" element={<ProtectedRoute requiredRole="patient"><PainLog /></ProtectedRoute>} />
      <Route path="/patient/completion" element={<ProtectedRoute requiredRole="patient"><CompletionScreen /></ProtectedRoute>} />
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
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
