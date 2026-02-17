import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const PainLog = () => {
  const navigate = useNavigate();
  const [painLevel, setPainLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title="Log Pain Level" showBack />

        <SectionCard className="mb-6">
          <div className="space-y-6 py-2">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{painLevel[0]}</p>
              <p className="mt-1 text-muted-foreground">
                {painLevel[0] <= 3
                  ? "Mild discomfort"
                  : painLevel[0] <= 6
                  ? "Moderate pain"
                  : "Severe pain"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>No pain</span>
                <span>Worst pain</span>
              </div>
              <Slider
                value={painLevel}
                onValueChange={setPainLevel}
                max={10}
                min={0}
                step={1}
                className="py-2"
              />
            </div>
          </div>
        </SectionCard>

        <div className="mb-6 space-y-2">
          <Label className="text-[13px] font-medium text-muted-foreground">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any specific pain areas..."
            className="min-h-[100px] rounded-xl border-border bg-card text-[15px] focus-visible:ring-primary"
          />
        </div>

        <PrimaryButton onClick={() => navigate("/patient/home")}>Submit Log</PrimaryButton>
      </div>
    </div>
  );
};

export default PainLog;
