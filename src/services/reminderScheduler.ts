/**
 * ⏰ BACKGROUND REMINDER SCHEDULER
 * Safe scheduler that runs every minute and sends reminders
 * Prevents duplicate sends and follows medical standards
 * 
 * Design:
 * - Runs once per minute (not per patient)
 * - Queries all patients due for reminders
 * - Prevents duplicate sends with 1-minute lock
 * - Professional, calm notification content
 * - Respects user timezone and preferences
 */

import { getPatientsDueForReminders, logReminderSent } from "@/services/reminderAPI";
import { sendExerciseReminder } from "@/services/medicalReminder";

// ✅ SCHEDULER STATE
let schedulerRunning = false;
let schedulerIntervalId: NodeJS.Timeout | null = null;

/**
 * ✅ START REMINDER SCHEDULER
 * Initializes the background scheduler
 * Runs every 60 seconds to check for due reminders
 * Should be called when user logs in or app starts
 * @returns Function to stop the scheduler
 */
export const startReminderScheduler = (): (() => void) => {
  console.log("🚀 Starting reminder scheduler...");

  // Prevent multiple schedulers
  if (schedulerRunning) {
    console.warn("⚠️ Scheduler already running");
    return stopReminderScheduler;
  }

  schedulerRunning = true;

  // ✅ RUN CHECK EVERY 60 SECONDS
  // This is safe and won't overload the system
  schedulerIntervalId = setInterval(() => {
    checkAndSendReminders();
  }, 60 * 1000); // 60 seconds

  // Also run immediately on start
  checkAndSendReminders();

  console.log("✅ Reminder scheduler started (runs every 60 seconds)");

  return stopReminderScheduler;
};

/**
 * ✅ STOP REMINDER SCHEDULER
 * Cleanly stops the background scheduler
 */
export const stopReminderScheduler = (): void => {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }

  schedulerRunning = false;
  console.log("⏹️ Reminder scheduler stopped");
};

/**
 * ✅ CHECK AND SEND REMINDERS
 * Core scheduler logic
 * 1. Get patients whose reminder time matches now
 * 2. Send reminder notification
 * 3. Log the send (prevents duplicates)
 * 4. Handle errors gracefully
 */
const checkAndSendReminders = async (): Promise<void> => {
  try {
    // ✅ STEP 1: Query database for patients due for reminders
    const patientsDue = await getPatientsDueForReminders();

    if (!patientsDue || patientsDue.length === 0) {
      // Normal - most minutes won't have due reminders
      return;
    }

    console.log(`📨 Found ${patientsDue.length} patient(s) due for reminders`);

    // ✅ STEP 2: Send reminder to each patient
    for (const patient of patientsDue) {
      try {
        // Send the notification
        const sent = await sendExerciseReminder();

        if (sent) {
          // ✅ STEP 3: Log the send to prevent duplicates
          await logReminderSent(patient.patient_id, patient.reminder_time, "exercise");
          console.log(`✅ Reminder sent to patient ${patient.patient_id}`);
        }
      } catch (error) {
        // Log error but continue with other patients
        console.error(
          `❌ Error sending reminder to patient ${patient.patient_id}:`,
          error
        );
      }
    }
  } catch (error) {
    // Log error but don't crash the scheduler
    console.error("❌ Error in reminder scheduler:", error);
  }
};

/**
 * ✅ IS SCHEDULER RUNNING
 * Check if the scheduler is currently active
 * @returns True if scheduler is running
 */
export const isSchedulerRunning = (): boolean => {
  return schedulerRunning;
};

/**
 * ✅ MANUAL REMINDER TRIGGER (For testing or special cases)
 * Immediately send a reminder to a specific patient
 * Useful for testing or emergency reminders
 * @param patientId - UUID of patient
 * @returns Success status
 */
export const triggerManualReminder = async (patientId: string): Promise<boolean> => {
  try {
    console.log(`⏱️ Triggering manual reminder for patient ${patientId}`);

    // Send notification
    const sent = await sendExerciseReminder();

    if (sent) {
      // Log it
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      await logReminderSent(patientId, currentTime, "exercise");
      console.log(`✅ Manual reminder sent to patient ${patientId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error triggering manual reminder:`, error);
    return false;
  }
};

/**
 * ✅ SCHEDULER LIFECYCLE HOOKS
 * Use these to integrate scheduler with app lifecycle
 */

// Auto-start scheduler when loaded
let autoStarted = false;

/**
 * Initialize autoclient-side scheduler
 * Call this once when app starts and user is logged in
 */
export const initializeScheduler = (): void => {
  if (!autoStarted) {
    startReminderScheduler();
    autoStarted = true;
  }
};

/**
 * Cleanup when user logs out
 */
export const cleanupScheduler = (): void => {
  stopReminderScheduler();
  autoStarted = false;
};

/**
 * ✅ DEBUG: GET SCHEDULER STATUS
 * Returns current scheduler state for debugging
 */
export const getSchedulerStatus = (): {
  running: boolean;
  hasInterval: boolean;
  autoStarted: boolean;
} => {
  return {
    running: schedulerRunning,
    hasInterval: schedulerIntervalId !== null,
    autoStarted,
  };
};

/**
 * ✅ SCHEDULER RULES (For reference)
 * 
 * How the scheduler prevents problems:
 * 
 * 1. ONE PROCESS: Runs once per minute across entire app
 *    ❌ NOT: One interval per patient (would create N timers)
 *    ✅ YES: Query database once per minute for due patients
 * 
 * 2. DUPLICATE PREVENTION: Database locks prevent resending
 *    ❌ NOT: Client-side countdown timers
 *    ✅ YES: `last_reminder_sent_at` field blocks sends < 1 minute apart
 * 
 * 3. NO AGGRESSIVE LOOPS: Respectful to system resources
 *    ❌ NOT: Every 1 hour, every 2 hours globally
 *    ✅ YES: Check every 60 seconds, send only when time matches
 * 
 * 4. PROFESSIONAL CONTENT: Medical standards
 *    ❌ NOT: "Time for your exercises! 💪", "Don't forget!"
 *    ✅ YES: "Time for Your Physiotherapy Exercises"
 * 
 * 5. USER CONTROL: Patients can customize
 *    ❌ NOT: Global schedule applied to all users
 *    ✅ YES: Each patient has their own reminder_times array
 * 
 * 6. SMART FEATURES (Optional):
 *    ✅ Skip notification if exercises already completed today
 *    ✅ Show next reminder time in doctor UI
 */
