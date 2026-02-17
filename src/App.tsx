import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/add-patient" element={<AddPatient />} />
          <Route path="/doctor/assign-exercise" element={<AssignExercise />} />
          <Route path="/doctor/patient-progress" element={<PatientProgress />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/patient/home" element={<PatientHome />} />
          <Route path="/patient/exercise" element={<ExerciseDetail />} />
          <Route path="/patient/pain-log" element={<PainLog />} />
          <Route path="/patient/completion" element={<CompletionScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
