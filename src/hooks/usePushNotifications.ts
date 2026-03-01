/**
 * 🪝 CUSTOM HOOK FOR PUSH NOTIFICATIONS
 * Think of this like a "notification manager" for your React app
 * It's a tool you use anywhere in your app to work with notifications
 */

import { useEffect, useState } from "react";
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  setupNotificationHandlers,
  sendSystemNotification,
} from "@/services/pushNotification";

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPermitted, setIsPermitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Check 1: Does browser support notifications?
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      console.warn("⚠️ Browser doesn't support notifications");
      return;
    }

    // ✅ Check 2: Does user already have permission?
    const hasPermission = Notification.permission === "granted";
    setIsPermitted(hasPermission);
    setIsLoading(false);

    // ✅ Setup handlers for when notifications are clicked
    setupNotificationHandlers();

    // ✅ Register Service Worker (The background helper)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("✅ Service Worker registered");
          return registration;
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }
  }, []);

  // ✅ FUNCTION TO REQUEST PERMISSION FROM USER
  const requestPermission = async () => {
    if (!isSupported) {
      alert("Your browser doesn't support notifications");
      return false;
    }

    setIsLoading(true);
    const granted = await requestNotificationPermission();
    setIsPermitted(granted);
    setIsLoading(false);

    return granted;
  };

  return {
    isSupported,
    isPermitted,
    isLoading,
    requestPermission,
  };
};

// ✅ SIMPLE NOTIFICATION DEMO HOOK (For testing)
export const useSendTestNotification = () => {
  const sendTest = async () => {
    await sendSystemNotification("👋 This is a test notification! Everything is working!");
  };

  return { sendTest };
};
