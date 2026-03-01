/**
 * 🔔 MEDICAL NOTIFICATION SETUP COMPONENT
 * Requests notification permissions and starts the reminder scheduler
 * Professional medical-grade setup with calm tone
 * Should be placed in App.tsx for logged-in users
 */

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalReminders } from "@/hooks/useMedicalReminders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

/**
 * ✅ MEDICAL NOTIFICATION SETUP COMPONENT
 * Handles:
 * 1. Checking browser notification support
 * 2. Requesting user permission
 * 3. Starting the reminder scheduler
 * 4. Displaying status
 */
export const MedicalNotificationSetup = () => {
  const { user, role } = useAuth();
  const { isSupported, isPermitted, isLoading, schedulerRunning, requestPermission } =
    useMedicalReminders();

  // ✅ AUTO-REQUEST PERMISSION ON FIRST VISIT
  useEffect(() => {
    if (!user) return;
    if (isLoading) return;
    if (isPermitted) return; // Already granted
    if (!isSupported) return; // Not supported

    // Auto-request on first visit (subtle, non-intrusive)
    // This only happens once browser permission is needed
    console.log(
      "🔔 Medical notification service available - ready for patient reminders"
    );
  }, [user, isLoading, isPermitted, isSupported]);

  // ✅ HANDLE PERMISSION GRANT
  const handleEnableReminders = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Reminders enabled - you'll receive notifications on schedule");
    } else {
      toast.error("Notification permission required for reminders");
    }
  };

  // ✅ DON'T SHOW ANYTHING IF NOT LOGGED IN
  if (!user) {
    return null;
  }

  // ✅ DON'T SHOW IF NOT A PATIENT (only patients receive reminders)
  if (role !== "patient") {
    return null;
  }

  // ✅ IF NOT SUPPORTED, SILENTLY FAIL
  if (!isSupported) {
    console.warn("⚠️ Browser doesn't support notifications");
    return null;
  }

  // ✅ IF ALREADY PERMITTED, SILENTLY SUCCEED
  if (isPermitted && schedulerRunning) {
    // Scheduler is running, reminders are active
    return null;
  }

  // ✅ SHOW PERMISSION REQUEST BANNER
  if (!isPermitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
        <Card className="w-80 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-lg">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Bell size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Exercise Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when it's time for your exercises
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleEnableReminders}
              disabled={isLoading}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Bell size={16} />
              {isLoading ? "Checking..." : "Enable Reminders"}
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground">
              ✓ Professional notifications only
              <br />✓ Respects your configured times
              <br />✓ No aggressive messages
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Bell size={16} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Initializing reminders...</p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

/**
 * ✅ REMIND NOTIFICATION SETUP (Inline, non-intrusive)
 * Minimal stateless component for checking notification status
 * Can be placed in NavBar or header
 */
export const MedicalReminderStatusBadge = () => {
  const { user, role } = useAuth();
  const { isSupported, isPermitted, schedulerRunning } = useMedicalReminders();

  // ✅ ONLY SHOW FOR PATIENTS
  if (!user || role !== "patient") {
    return null;
  }

  if (!isSupported) {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle size={12} />
        <span className="text-xs">Reminders not supported</span>
      </Badge>
    );
  }

  if (!isPermitted) {
    return (
      <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700">
        <AlertCircle size={12} />
        <span className="text-xs">Reminders disabled</span>
      </Badge>
    );
  }

  if (schedulerRunning) {
    return (
      <Badge className="gap-1 bg-green-100 text-green-800">
        <CheckCircle2 size={12} />
        <span className="text-xs">Reminders active</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Clock size={12} />
      <span className="text-xs">Initializing...</span>
    </Badge>
  );
};

/**
 * ✅ DEBUG PANEL (For development only)
 * Shows detailed reminder and scheduler status
 */
export const MedicalReminderDebugPanel = () => {
  const { user } = useAuth();
  const { isSupported, isPermitted, schedulerRunning } = useMedicalReminders();

  if (!user || !process.env.DEBUG_MODE) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 w-64 bg-black p-3 text-xs text-white">
      <p className="font-mono">
        Supported: {isSupported ? "✓" : "✗"}
        <br />
        Permitted: {isPermitted ? "✓" : "✗"}
        <br />
        Scheduler: {schedulerRunning ? "🟢 Running" : "🔴 Stopped"}
      </p>
    </Card>
  );
};

export default MedicalNotificationSetup;
