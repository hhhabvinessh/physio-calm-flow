import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, TrendingUp } from "lucide-react";

const painLogs = [
  { date: "Feb 15, 2026", level: 4, note: "Mild pain after squats" },
  { date: "Feb 13, 2026", level: 6, note: "Stiffness in the morning" },
  { date: "Feb 11, 2026", level: 3, note: "Feeling better overall" },
];

const PatientProgress = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container pb-8">
        <PageHeader title="Patient Progress" showBack />

        {/* Main stats */}
        <SectionCard className="mb-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--muted))" strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={`${72 * 2.64} ${100 * 2.64}`}
                  strokeLinecap="round"
                  className="animate-progress"
                />
              </svg>
              <span className="absolute text-2xl font-semibold">72%</span>
            </div>
            <p className="text-muted-foreground">Overall Completion</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <div>
                <p className="text-[13px] text-muted-foreground">Last Active</p>
                <p className="text-[14px] font-medium">Today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <div>
                <p className="text-[13px] text-muted-foreground">Avg. Pain</p>
                <p className="text-[14px] font-medium">4.3 / 10</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Pain logs */}
        <h3 className="mb-3">Pain Logs</h3>
        <div className="space-y-3">
          {painLogs.map((log, i) => (
            <SectionCard key={i}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] text-muted-foreground">{log.date}</p>
                  <p className="text-[14px]">{log.note}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-semibold text-foreground">{log.level}</span>
                  <span className="text-[11px] text-muted-foreground">/10</span>
                </div>
              </div>
              <Progress value={log.level * 10} className="mt-2 h-1.5" />
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientProgress;
