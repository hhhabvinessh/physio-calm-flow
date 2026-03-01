/**
 * 🔔 NOTIFICATION SETUP COMPONENT
 * This component asks the user "Can we send you notifications?"
 * It shows a nice dialog, not an annoying popup
 */

import { useCallback, useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export const NotificationSetup = () => {
  const { isSupported, isPermitted, isLoading, requestPermission } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  const showNotificationPrompt = useCallback(async () => {
    // Show a friendly toast asking for permission
    const handler = toast(
      <div className="flex items-start gap-3">
        <Bell className="mt-1 text-blue-500" size={20} />
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Stay Updated! 🔔</p>
          <p className="text-sm text-muted-foreground">
            Get reminders for exercises and updates from your doctor
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await requestPermission();
                setIsDismissed(true);
                toast.dismiss(handler);
                toast.success("✅ Notifications enabled!");
              }}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Enable
            </button>
            <button
              onClick={() => {
                setIsDismissed(true);
                toast.dismiss(handler);
              }}
              className="px-3 py-1 text-sm bg-muted text-foreground rounded hover:bg-muted/80"
            >
              Later
            </button>
          </div>
        </div>
      </div>,
      {
        duration: 30000, // Show for 30 seconds
      }
    );
  }, [requestPermission]);

  // ✅ AUTO-SHOW NOTIFICATION PROMPT ON FIRST LOGIN
  useEffect(() => {
    if (!isLoading && isSupported && !isPermitted && !isDismissed) {
      // Wait a moment for the page to settle, then show notification prompt
      const timer = setTimeout(() => {
        showNotificationPrompt();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isSupported, isPermitted, isDismissed, showNotificationPrompt]);

  // This component doesn't render anything on screen
  // It just handles the notification setup behind the scenes
  return null;
};
