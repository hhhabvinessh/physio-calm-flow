/**
 * 🔔 EXERCISE REMINDER SETTINGS COMPONENT
 * Doctor UI for configuring patient reminder preferences
 * Part of Patient Details page
 * Clean medical design with soft colors and professional tone
 */

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getPatientReminderSettings,
  updatePatientReminderSettings,
  ReminderSettings,
} from "@/services/reminderAPI";
import {
  validateReminderTimes,
  sortReminderTimes,
  formatTimeForDisplay,
  isValidTimeFormat,
} from "@/lib/reminderValidation";

interface ExerciseReminderSettingsProps {
  patientId: string;
}

/**
 * ✅ EXERCISE REMINDER SETTINGS COMPONENT
 * Allows doctors to manage when patients receive exercise reminders
 */
export const ExerciseReminderSettings = ({ patientId }: ExerciseReminderSettingsProps) => {
  // ✅ STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00", "18:00"]);
  const [newTime, setNewTime] = useState("");
  const [errors, setErrors] = useState<{ times?: string; add?: string }>({});

  // ✅ LOAD REMINDER SETTINGS ON MOUNT
  const loadReminderSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getPatientReminderSettings(patientId);

      if (error) {
        toast.error("Failed to load reminder settings");
        console.error(error);
        return;
      }

      if (data) {
        setReminderEnabled(data.reminder_enabled);
        setReminderTimes(sortReminderTimes(data.reminder_times || ["08:00", "18:00"]));
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      toast.error("Failed to load reminder settings");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadReminderSettings();
  }, [loadReminderSettings]);

  // ✅ HANDLE TOGGLE REMINDER STATUS
  const handleToggleReminder = async (enabled: boolean) => {
    try {
      setSaving(true);
      const { success, error } = await updatePatientReminderSettings(patientId, {
        reminder_enabled: enabled,
        reminder_times: reminderTimes,
      });

      if (!success || error) {
        toast.error(error?.message || "Failed to update reminder status");
        return;
      }

      setReminderEnabled(enabled);
      toast.success(enabled ? "Reminders enabled" : "Reminders disabled");
    } catch (err) {
      console.error("Error updating reminder status:", err);
      toast.error("Failed to update reminder status");
    } finally {
      setSaving(false);
    }
  };

  // ✅ ADD NEW REMINDER TIME
  const handleAddTime = async () => {
    setErrors({});

    // Validate input
    if (!newTime) {
      setErrors({ add: "Please enter a time" });
      return;
    }

    if (!isValidTimeFormat(newTime)) {
      setErrors({ add: "Invalid time format. Use HH:MM (24-hour)" });
      return;
    }

    // Check for duplicates
    if (reminderTimes.includes(newTime)) {
      setErrors({ add: "This time is already added" });
      return;
    }

    // Check max 3 times
    if (reminderTimes.length >= 3) {
      setErrors({ add: "Maximum 3 reminder times allowed" });
      return;
    }

    try {
      setSaving(true);
      const updatedTimes = sortReminderTimes([...reminderTimes, newTime]);

      // Validate all times together
      const validation = validateReminderTimes(updatedTimes);
      if (!validation.valid) {
        setErrors({ add: validation.error });
        return;
      }

      // Save to database
      const { success, error } = await updatePatientReminderSettings(patientId, {
        reminder_enabled: reminderEnabled,
        reminder_times: updatedTimes,
      });

      if (!success || error) {
        toast.error(error?.message || "Failed to add reminder time");
        return;
      }

      setReminderTimes(updatedTimes);
      setNewTime("");
      toast.success("Reminder time added");
    } catch (err) {
      console.error("Error adding time:", err);
      toast.error("Failed to add reminder time");
    } finally {
      setSaving(false);
    }
  };

  // ✅ REMOVE REMINDER TIME
  const handleRemoveTime = async (timeToRemove: string) => {
    try {
      setSaving(true);
      const updatedTimes = reminderTimes.filter((t) => t !== timeToRemove);

      // Check at least one time remains
      if (updatedTimes.length === 0) {
        toast.error("At least one reminder time is required");
        return;
      }

      // Save to database
      const { success, error } = await updatePatientReminderSettings(patientId, {
        reminder_enabled: reminderEnabled,
        reminder_times: updatedTimes,
      });

      if (!success || error) {
        toast.error(error?.message || "Failed to remove reminder time");
        return;
      }

      setReminderTimes(updatedTimes);
      toast.success("Reminder time removed");
    } catch (err) {
      console.error("Error removing time:", err);
      toast.error("Failed to remove reminder time");
    } finally {
      setSaving(false);
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-blue-100/50 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-blue-100/50 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-blue-100/30 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* ✅ HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Clock size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Exercise Reminder Settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure when this patient receives exercise reminders
            </p>
          </div>
        </div>

        {/* ✅ STATUS BADGE */}
        <Badge
          className={reminderEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}
        >
          {reminderEnabled ? (
            <>
              <CheckCircle2 size={14} className="mr-1" />
              Active
            </>
          ) : (
            <>
              <AlertCircle size={14} className="mr-1" />
              Inactive
            </>
          )}
        </Badge>
      </div>

      {/* ✅ SECTION 1: TOGGLE REMINDERS */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4">
        <div>
          <p className="font-medium text-foreground">Enable Reminders</p>
          <p className="text-sm text-muted-foreground">
            {reminderEnabled
              ? "Patient will receive reminders at scheduled times"
              : "Patient will not receive any reminders"}
          </p>
        </div>
        <Switch
          checked={reminderEnabled}
          onCheckedChange={handleToggleReminder}
          disabled={saving}
        />
      </div>

      {/* ✅ SECTION 2: REMINDER TIMES (only show if enabled) */}
      {reminderEnabled && (
        <div className="space-y-4">
          {/* ✅ CURRENT TIMES */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Reminder Times</Label>
            <div className="flex flex-wrap gap-2">
              {reminderTimes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No reminder times set</p>
              ) : (
                reminderTimes.map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm"
                  >
                    <Clock size={14} className="text-blue-600" />
                    <span className="font-mono text-sm font-medium text-foreground">
                      {formatTimeForDisplay(time)}
                    </span>
                    <button
                      onClick={() => handleRemoveTime(time)}
                      disabled={saving || reminderTimes.length <= 1}
                      className="ml-1 rounded-full p-0.5 hover:bg-red-100 disabled:opacity-50"
                      aria-label={`Remove ${time}`}
                    >
                      <X size={14} className="text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ✅ ADD NEW TIME */}
          {reminderTimes.length < 3 && (
            <div className="space-y-2">
              <Label htmlFor="new-time" className="text-sm font-medium text-foreground">
                Add Reminder Time
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="new-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => {
                      setNewTime(e.target.value);
                      setErrors({});
                    }}
                    disabled={saving}
                    placeholder="00:00"
                    className="border-blue-200"
                  />
                  {errors.add && (
                    <p className="mt-1 text-xs text-red-600">{errors.add}</p>
                  )}
                </div>
                <Button
                  onClick={handleAddTime}
                  disabled={saving || !newTime}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum 3 times per day • Format: HH:MM (24-hour)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ✅ INFO BOX */}
      <div className="mt-6 rounded-lg bg-white p-4 text-sm">
        <h4 className="mb-2 font-medium text-foreground">Professional Standards</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>✓ Reminders are professional and non-aggressive</li>
          <li>✓ Each patient has personalized reminder times</li>
          <li>✓ Patients receive one notification per scheduled time</li>
          <li>✓ All changes are audited for compliance</li>
          <li>✓ Patients can skip if exercises already completed</li>
        </ul>
      </div>
    </Card>
  );
};

export default ExerciseReminderSettings;
