/**
 * 🪝 USE MEDICAL REMINDERS HOOK
 * Custom React hook for managing reminder functionality
 * Integrates with the scheduler and provides reminder state
 */

import { useEffect, useState } from "react";
import {
  initializeScheduler,
  cleanupScheduler,
  isSchedulerRunning,
} from "@/services/reminderScheduler";
import {
  hasNotificationPermission,
  isNotificationSupported,
  requestMedicalNotificationPermission,
} from "@/services/medicalReminder";
import { useAuth } from "@/contexts/AuthContext";

interface UseMedicalRemindersReturn {
  // Notification status
  isSupported: boolean;
  isPermitted: boolean;
  isLoading: boolean;

  // Scheduler status
  schedulerRunning: boolean;

  // Actions
  requestPermission: () => Promise<boolean>;
  startScheduler: () => void;
  stopScheduler: () => void;
}

/**
 * ✅ USE MEDICAL REMINDERS HOOK
 * Manages notification permissions, scheduler lifecycle, and state
 * Should be called once per app load (in App.tsx or main layout)
 *
 * @returns Object with reminder state and control functions
 *
 * @example
 * const { isPermitted, schedulerRunning, requestPermission, startScheduler } = useMedicalReminders();
 *
 * if (!isPermitted) {
 *   return <button onClick={requestPermission}>Enable Reminders</button>;
 * }
 *
 * if (!schedulerRunning) {
 *   return <button onClick={startScheduler}>Start Scheduler</button>;
 * }
 */
export const useMedicalReminders = (): UseMedicalRemindersReturn => {
  const { user } = useAuth();
  const [isSupported] = useState(isNotificationSupported());
  const [isPermitted, setIsPermitted] = useState(hasNotificationPermission());
  const [isLoading, setIsLoading] = useState(true);
  const [schedulerRunning, setSchedulerRunning] = useState(false);

  // ✅ INITIALIZE ON MOUNT
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Verify notification permission status
    const permitted = hasNotificationPermission();
    setIsPermitted(permitted);

    // Auto-start scheduler if permitted and supported
    if (permitted && isSupported) {
      initializeScheduler();
      setSchedulerRunning(isSchedulerRunning());
    }

    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      // Don't stop scheduler on component unmount
      // Only stop explicitly when user logs out
    };
  }, [user, isSupported]);

  // ✅ REQUEST PERMISSION
  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await requestMedicalNotificationPermission();
      setIsPermitted(granted);

      // Auto-start scheduler if permission granted
      if (granted && isSupported) {
        initializeScheduler();
        setSchedulerRunning(isSchedulerRunning());
      }

      return granted;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ START SCHEDULER
  const startScheduler = (): void => {
    if (!isPermitted) {
      console.warn("Cannot start scheduler without notification permission");
      return;
    }

    initializeScheduler();
    setSchedulerRunning(isSchedulerRunning());
  };

  // ✅ STOP SCHEDULER
  const stopScheduler = (): void => {
    cleanupScheduler();
    setSchedulerRunning(false);
  };

  return {
    isSupported,
    isPermitted,
    isLoading,
    schedulerRunning,
    requestPermission,
    startScheduler,
    stopScheduler,
  };
};

export default useMedicalReminders;
