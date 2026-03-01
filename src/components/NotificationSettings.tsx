/**
 * 🔧 NOTIFICATION SETTINGS COMPONENT
 * Shows notification status and lets users test them
 * Great for debugging and demo purposes
 */

import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  sendExerciseReminder,
  sendPainTrackingReminder,
  sendNewAssignment,
  sendSystemNotification,
} from "@/services/pushNotification";

export const NotificationSettings = () => {
  const { isSupported, isPermitted, isLoading, requestPermission } = usePushNotifications();
  const [isSending, setIsSending] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded-full" />
          <div>Loading notification settings...</div>
        </div>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="p-4 border-yellow-200 bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-yellow-900">Notifications not supported</p>
            <p className="text-sm text-yellow-800 mt-1">
              Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleTestNotification = async (type: string) => {
    setIsSending(true);
    try {
      switch (type) {
        case "exercise":
          await sendExerciseReminder("Shoulder Mobility Stretch");
          break;
        case "pain":
          await sendPainTrackingReminder();
          break;
        case "assignment":
          await sendNewAssignment("Smith");
          break;
        case "system":
          await sendSystemNotification("This is a test notification!");
          break;
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
    setIsSending(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-primary" size={24} />
          <div>
            <h3 className="font-semibold">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>
        {isPermitted ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle size={14} className="mr-1" />
            Enabled
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle size={14} className="mr-1" />
            Disabled
          </Badge>
        )}
      </div>

      {!isPermitted && (
        <div className="mb-6">
          <Button onClick={requestPermission} className="w-full">
            Enable Notifications
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            We'll send you reminders for exercises and important updates from your doctor.
          </p>
        </div>
      )}

      {isPermitted && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            🧪 Test notifications to see how they work:
          </p>

          <Button
            onClick={() => handleTestNotification("exercise")}
            disabled={isSending}
            variant="outline"
            className="w-full justify-start"
          >
            <Bell size={16} className="mr-2" />
            Test Exercise Reminder
          </Button>

          <Button
            onClick={() => handleTestNotification("pain")}
            disabled={isSending}
            variant="outline"
            className="w-full justify-start"
          >
            <Bell size={16} className="mr-2" />
            Test Pain Tracking Reminder
          </Button>

          <Button
            onClick={() => handleTestNotification("assignment")}
            disabled={isSending}
            variant="outline"
            className="w-full justify-start"
          >
            <Bell size={16} className="mr-2" />
            Test New Assignment
          </Button>

          <Button
            onClick={() => handleTestNotification("system")}
            disabled={isSending}
            variant="outline"
            className="w-full justify-start"
          >
            <Bell size={16} className="mr-2" />
            Test System Message
          </Button>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-1">💡 How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>You'll get notifications about your exercises</li>
              <li>Reminders to log your pain levels</li>
              <li>Updates when your doctor assigns new exercises</li>
              <li>System messages from the app</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
