import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import FormField from "@/components/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AddPatient = () => {
  const navigate = useNavigate();
  const [loginId] = useState("PT-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [tempPassword] = useState("temp-" + Math.random().toString(36).substring(2, 8));

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title="Add Patient" showBack />

        <div className="space-y-4">
          <FormField label="Full Name" id="name" placeholder="e.g. Sarah Johnson" />
          <FormField label="Age" id="age" type="number" placeholder="e.g. 34" />

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">Gender</Label>
            <Select>
              <SelectTrigger className="h-12 rounded-xl border-border bg-card text-[15px]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Height (cm)" id="height" type="number" placeholder="170" />
            <FormField label="Weight (kg)" id="weight" type="number" placeholder="70" />
          </div>

          <FormField label="Diagnosis" id="diagnosis" placeholder="e.g. ACL Reconstruction" />

          <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
            <p className="text-[13px] font-medium text-muted-foreground">Generated Credentials</p>
            <FormField label="Login ID" id="loginId" value={loginId} onChange={() => {}} />
            <FormField label="Temporary Password" id="tempPass" value={tempPassword} onChange={() => {}} />
          </div>

          <div className="pt-2">
            <PrimaryButton onClick={() => navigate("/doctor/assign-exercise")}>
              Save & Assign Plan
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
