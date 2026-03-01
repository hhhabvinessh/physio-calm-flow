/**
 * 📢 PROFESSIONAL MEDICAL NOTIFICATION SERVICE
 * Sends professional, calm, medical-standard notifications
 * All notifications follow HIPAA-compliant and patient-friendly guidelines
 * No aggressive language, emojis, or marketing tone
 */

/**
 * Notification content templates for different reminder types
 * All content follows professional healthcare standards
 */
export const NOTIFICATION_CONTENT = {
  // ✅ EXERCISE REMINDER - Professional and calming
  exercise: {
    title: "Time for Your Physiotherapy Exercises",
    body: "Please complete your assigned rehabilitation exercises.",
  },

  // ✅ PAIN TRACKING REMINDER - Simple and direct
  pain_log: {
    title: "Pain Assessment Time",
    body: "Please update your pain level in the app.",
  },

  // ✅ NEW ASSIGNMENT - Informative
  new_assignment: {
    title: "New Exercise Assigned",
    body: "Your doctor has assigned new rehabilitation exercises.",
  },

  // ✅ PRESCRIPTION update - Professional
  prescription_update: {
    title: "Treatment Plan Update",
    body: "Your doctor has updated your exercise plan.",
  },

  // ✅ PROGRESS MILESTONE - Encouraging but professional
  milestone: {
    title: "Progress Achieved",
    body: "Keep up your commitment to your rehabilitation.",
  },

  // ✅ SYSTEM MESSAGE - Neutral
  system: {
    title: "Physio Calm Flow Notification",
    body: "This is a message from your physiotherapy app.",
  },
};

export type NotificationType = keyof typeof NOTIFICATION_CONTENT;

/**
 * ✅ SEND MEDICAL REMINDER NOTIFICATION
 * Sends a professional reminder notification to a patient
 * Used by the scheduler service for automated reminders
 * @param title - Notification title
 * @param body - Notification body text
 * @param tag - Unique tag to prevent duplicate notifications
 * @param reminderType - Type of reminder for logging
 * @returns Success status
 */
export const sendMedicalReminder = async (
  title: string,
  body: string,
  tag: string,
  reminderType: NotificationType = "exercise"
): Promise<boolean> => {
  try {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("⚠️ Notifications not supported in this browser");
      return false;
    }

    if (Notification.permission !== "granted") {
      console.warn("⚠️ Notification permission not granted");
      return false;
    }

    // ✅ Register and notify via service worker
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag, // Prevents duplicate notifications with same tag
      badge: "/icon-192.png",
      icon: "/icon-192.png",
      // Professional styling - no aggressive notifications
      requireInteraction: false, // Allows auto-dismiss
      data: {
        type: reminderType,
        timestamp: Date.now(),
        url: getReminderActionUrl(reminderType),
      },
    });

    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return false;
  }
};

/**
 * ✅ SEND EXERCISE REMINDER
 * Professional reminder for exercise session
 * @returns Success status
 */
export const sendExerciseReminder = async (): Promise<boolean> => {
  const content = NOTIFICATION_CONTENT.exercise;
  return await sendMedicalReminder(
    content.title,
    content.body,
    `exercise-${Date.now()}`,
    "exercise"
  );
};

/**
 * ✅ SEND PAIN TRACKING REMINDER
 * Professional reminder to log pain levels
 * @returns Success status
 */
export const sendPainTrackingReminder = async (): Promise<boolean> => {
  const content = NOTIFICATION_CONTENT.pain_log;
  return await sendMedicalReminder(
    content.title,
    content.body,
    `pain-log-${Date.now()}`,
    "pain_log"
  );
};

/**
 * ✅ SEND NEW ASSIGNMENT NOTIFICATION
 * Informs patient of newly assigned exercises
 * @returns Success status
 */
export const sendNewAssignment = async (): Promise<boolean> => {
  const content = NOTIFICATION_CONTENT.new_assignment;
  return await sendMedicalReminder(
    content.title,
    content.body,
    `new-assignment-${Date.now()}`,
    "new_assignment"
  );
};

/**
 * ✅ SEND PRESCRIPTION UPDATE NOTIFICATION
 * Notifies of changes to treatment plan
 * @returns Success status
 */
export const sendPrescriptionUpdate = async (): Promise<boolean> => {
  const content = NOTIFICATION_CONTENT.prescription_update;
  return await sendMedicalReminder(
    content.title,
    content.body,
    `prescription-update-${Date.now()}`,
    "prescription_update"
  );
};

/**
 * ✅ SEND MILESTONE NOTIFICATION
 * Celebrates progress (professional tone)
 * @returns Success status
 */
export const sendMilestoneNotification = async (): Promise<boolean> => {
  const content = NOTIFICATION_CONTENT.milestone;
  return await sendMedicalReminder(
    content.title,
    content.body,
    `milestone-${Date.now()}`,
    "milestone"
  );
};

/**
 * ✅ GET REMINDER ACTION URL
 * Returns the app URL to navigate to based on reminder type
 * @param reminderType - Type of reminder
 * @returns URL path for the reminder
 */
const getReminderActionUrl = (reminderType: NotificationType): string => {
  const urlMap: Record<NotificationType, string> = {
    exercise: "/patient/home",
    pain_log: "/patient/pain-log",
    new_assignment: "/patient/home",
    prescription_update: "/patient/home",
    milestone: "/patient/progress",
    system: "/",
  };

  return urlMap[reminderType] || "/";
};

/**
 * ✅ REQUEST NOTIFICATION PERMISSION
 * Asks user for browser notification permission
 * Professional explanation for clinical app
 * @returns Promise<boolean> - true if granted
 */
export const requestMedicalNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("⚠️ This browser doesn't support notifications");
    return false;
  }

  // Already granted
  if (Notification.permission === "granted") {
    return true;
  }

  // Already denied - don't ask again
  if (Notification.permission === "denied") {
    console.warn("⚠️ User denied notification permission");
    return false;
  }

  // Ask user
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("❌ Error requesting notification permission:", error);
    return false;
  }
};

/**
 * ✅ CHECK NOTIFICATION SUPPORT
 * Determines if the browser/app supports notifications
 * @returns True if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
};

/**
 * ✅ CHECK NOTIFICATION PERMISSION
 * Determines if user has granted notification permission
 * @returns True if permission granted
 */
export const hasNotificationPermission = (): boolean => {
  return Notification.permission === "granted";
};

/**
 * ✅ SETUP NOTIFICATION HANDLERS
 * Sets up event listeners for notification interactions
 * Handles click events and opens relevant app pages
 */
export const setupNotificationHandlers = (): void => {
  if (!("serviceWorker" in navigator)) return;

  // Handle notification clicks
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "NOTIFICATION_CLICK") {
      const data = event.data.payload;
      console.log("🎯 User clicked notification:", data);

      if (data.url) {
        // Navigate within app if possible, otherwise open in new window
        if (window.location.origin === event.origin) {
          window.location.href = data.url;
        } else {
          window.open(data.url, "_blank");
        }
      }
    }
  });
};
