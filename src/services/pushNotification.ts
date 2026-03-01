/**
 * 🔔 PUSH NOTIFICATION SERVICE
 * Think of this like a postal worker - it delivers messages to the user
 */

// ✅ CHECK IF BROWSER SUPPORTS NOTIFICATIONS
export const isPushNotificationSupported = (): boolean => {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
};

// ✅ ASK USER PERMISSION (Like asking "Can we send you messages?")
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    console.warn("❌ Your browser doesn't support notifications");
    return false;
  }

  // If user already said yes, we already have permission
  if (Notification.permission === "granted") {
    console.log("✅ Notification permission already granted");
    return true;
  }

  // If user already said no, don't ask again
  if (Notification.permission === "denied") {
    console.warn("❌ Notification permission denied by user");
    return false;
  }

  // Ask the user
  try {
    const permission = await Notification.requestPermission();
    console.log(`📍 User said: ${permission}`);
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// ✅ SEND A NOTIFICATION (Display a message to user)
export const sendNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!isPushNotificationSupported()) {
    console.warn("❌ Notifications not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("⚠️ No permission to send notifications");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // Use the service worker to send notification
    await registration.showNotification(title, {
      badge: "/logo.svg", // Your app logo
      icon: "/logo.svg",
      ...options,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// ✅ SEND NOTIFICATION WITH CUSTOM ACTIONS (Like buttons in the message)
export const sendActionNotification = async (
  title: string,
  body: string,
  tag: string,
  data?: Record<string, unknown>
): Promise<void> => {
  await sendNotification(title, {
    body,
    tag, // Prevents duplicate notifications with same tag
    data: {
      timestamp: Date.now(),
      ...data,
    },
    actions: [
      {
        action: "open",
        title: "Open",
        icon: "/action-open.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/action-close.png",
      },
    ],
  });
};

// ✅ SETUP NOTIFICATION HANDLERS (Like setting up doorbell actions)
export const setupNotificationHandlers = (): void => {
  if (!isPushNotificationSupported()) return;

  // When user clicks the notification
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICK") {
        const data = event.data.payload;
        console.log("🎯 User clicked notification:", data);

        // Open the app window
        if (data.url) {
          window.open(data.url, "_blank");
        }
      }
    });
  }
};

// ✅ SEND NOTIFICATION FOR EXERCISE REMINDER
export const sendExerciseReminder = async (exerciseName: string): Promise<void> => {
  await sendActionNotification(
    "Time for your exercise! 💪",
    `It's time to do: ${exerciseName}`,
    `exercise-${Date.now()}`,
    {
      url: "/patient/exercises",
      type: "exercise_reminder",
    }
  );
};

// ✅ SEND NOTIFICATION FOR PAIN TRACKING
export const sendPainTrackingReminder = async (): Promise<void> => {
  await sendActionNotification(
    "How's your pain? 📊",
    "Please update your pain log",
    `pain-log-${Date.now()}`,
    {
      url: "/patient/pain-log",
      type: "pain_log_reminder",
    }
  );
};

// ✅ SEND NOTIFICATION FOR NEW ASSIGNMENT
export const sendNewAssignment = async (doctorName: string): Promise<void> => {
  await sendActionNotification(
    "New Assignment! 📝",
    `Dr. ${doctorName} assigned you a new exercise`,
    `new-assignment-${Date.now()}`,
    {
      url: "/patient/home",
      type: "new_assignment",
    }
  );
};

// ✅ SEND NOTIFICATION FOR SYSTEM MESSAGES
export const sendSystemNotification = async (message: string): Promise<void> => {
  await sendNotification("Physio Calm Flow 📢", {
    body: message,
    tag: "system-notification",
  });
};
