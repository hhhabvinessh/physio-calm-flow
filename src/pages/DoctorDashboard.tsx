import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, User } from "lucide-react";

const patients = [
  { id: 1, name: "Sarah Johnson", diagnosis: "ACL Reconstruction Recovery", completion: 72, active: true },
  { id: 2, name: "Michael Chen", diagnosis: "Frozen Shoulder Rehab", completion: 45, active: true },
  { id: 3, name: "Emily Davis", diagnosis: "Lower Back Pain Therapy", completion: 90, active: false },
  { id: 4, name: "James Wilson", diagnosis: "Post-Knee Replacement", completion: 30, active: true },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader
          title="Dashboard"
          rightAction={
            <PrimaryButton
              fullWidth={false}
              onClick={() => navigate("/doctor/add-patient")}
              className="h-10 px-4"
            >
              <Plus size={18} className="mr-1" />
              Add Patient
            </PrimaryButton>
          }
        />

        <div className="space-y-3">
          {patients.map((patient) => (
            <SectionCard
              key={patient.id}
              hoverable
              onClick={() => navigate("/doctor/patient-progress")}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <User size={18} className="text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-[13px] text-muted-foreground">{patient.diagnosis}</p>
                    </div>
                    <Badge
                      variant={patient.active ? "default" : "secondary"}
                      className={
                        patient.active
                          ? "bg-primary/10 text-primary hover:bg-primary/10"
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      }
                    >
                      {patient.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={patient.completion} className="h-2 flex-1" />
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {patient.completion}%
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
