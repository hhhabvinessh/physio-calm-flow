import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

  // Auto-redirect after login
  if (!loading && user && role && (window.location.pathname === "/login" || window.location.pathname === "/signup" || window.location.pathname === "/")) {
    const redirect = role === "doctor" ? "/doctor/dashboard" : "/patient/home";
    return <Navigate to={redirect} replace />;
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
