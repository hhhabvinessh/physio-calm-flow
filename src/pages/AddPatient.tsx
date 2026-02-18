import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import FormField from "@/components/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginId] = useState("PT-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [tempPassword] = useState("temp-" + Math.random().toString(36).substring(2, 8));

  const handleSave = async () => {
    if (!fullName) {
      toast.error("Patient name is required");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("patients")
      .insert({
        doctor_id: user!.id,
        full_name: fullName,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        diagnosis: diagnosis || null,
        login_id: loginId,
      })
      .select()
      .single();
    setLoading(false);

    if (error) {
      toast.error("Failed to create patient");
      console.error(error);
    } else {
      toast.success("Patient created!");
      navigate(`/doctor/assign-exercise/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title="Add Patient" showBack />

        <div className="space-y-4">
          <FormField label="Full Name" id="name" placeholder="e.g. Sarah Johnson" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <FormField label="Age" id="age" type="number" placeholder="e.g. 34" value={age} onChange={(e) => setAge(e.target.value)} />

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
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
            <FormField label="Height (cm)" id="height" type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
            <FormField label="Weight (kg)" id="weight" type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>

          <FormField label="Diagnosis" id="diagnosis" placeholder="e.g. ACL Reconstruction" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

          <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-3">
            <p className="text-[13px] font-medium text-muted-foreground">Generated Credentials</p>
            <FormField label="Login ID" id="loginId" value={loginId} onChange={() => {}} />
            <FormField label="Temporary Password" id="tempPass" value={tempPassword} onChange={() => {}} />
          </div>

          <div className="pt-2">
            <PrimaryButton onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save & Assign Plan"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
