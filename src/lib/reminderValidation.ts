/**
 * 📋 REMINDER VALIDATION UTILITIES
 * Provides validation logic for reminder times and settings
 * to ensure data integrity across the app
 */

/**
 * Validates a time string in HH:MM format
 * @param timeString - Time in HH:MM format
 * @returns true if valid, false otherwise
 * @example
 * isValidTimeFormat("08:00") // true
 * isValidTimeFormat("25:00") // false
 * isValidTimeFormat("8:30")  // false
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Validates an array of reminder times
 * Rules:
 * - Maximum 3 times
 * - Each time must be in valid HH:MM format
 * - No duplicate times
 * - Must not be empty array
 * @param times - Array of time strings
 * @returns Validation result with success flag and error message
 */
export const validateReminderTimes = (
  times: string[]
): { valid: boolean; error?: string } => {
  // Check if empty
  if (!times || times.length === 0) {
    return { valid: false, error: "At least one reminder time is required" };
  }

  // Check maximum 3 times
  if (times.length > 3) {
    return { valid: false, error: "Maximum 3 reminder times allowed" };
  }

  // Check for duplicates
  const uniqueTimes = new Set(times);
  if (uniqueTimes.size !== times.length) {
    return { valid: false, error: "Duplicate reminder times not allowed" };
  }

  // Check format of each time
  for (const time of times) {
    if (!isValidTimeFormat(time)) {
      return { valid: false, error: `Invalid time format: "${time}" (use HH:MM)` };
    }
  }

  return { valid: true };
};

/**
 * Sorts reminder times in chronological order
 * @param times - Array of time strings
 * @returns Sorted array
 * @example
 * sortReminderTimes(["18:00", "08:00"]) // ["08:00", "18:00"]
 */
export const sortReminderTimes = (times: string[]): string[] => {
  return [...times].sort((a, b) => {
    const [aHour, aMin] = a.split(":").map(Number);
    const [bHour, bMin] = b.split(":").map(Number);
    const aTotal = aHour * 60 + aMin;
    const bTotal = bHour * 60 + bMin;
    return aTotal - bTotal;
  });
};

/**
 * Checks if current time matches any reminder time
 * @param reminderTimes - Array of reminder times in HH:MM format
 * @returns true if current time matches, false otherwise
 */
export const isTimeForReminder = (reminderTimes: string[]): boolean => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return reminderTimes.includes(currentTime);
};

/**
 * Formats time for display
 * @param timeString - Time in HH:MM format
 * @returns Formatted time string (12-hour format with AM/PM)
 * @example
 * formatTimeForDisplay("08:00") // "8:00 AM"
 * formatTimeForDisplay("18:00") // "6:00 PM"
 */
export const formatTimeForDisplay = (timeString: string): string => {
  const [hour, minute] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Converts 12-hour time to 24-hour format
 * @param timeString - Time in 12-hour format (e.g., "8:30 AM")
 * @returns Time in 24-hour HH:MM format
 * @example
 * convertTo24HourFormat("8:30 AM")   // "08:30"
 * convertTo24HourFormat("6:00 PM")   // "18:00"
 * convertTo24HourFormat("12:30 AM")  // "00:30"
 */
export const convertTo24HourFormat = (timeString: string): string => {
  try {
    const [time, period] = timeString.split(" ");
    const [parsedHour, minute] = time.split(":").map(Number);
    let hour = parsedHour;

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  } catch (error) {
    console.error("Error converting time format:", error);
    return "";
  }
};

/**
 * Validates reminder settings object
 * @param settings - Reminder settings from database
 * @returns Validation result
 */
export interface ReminderSettings {
  reminder_enabled: boolean;
  reminder_times: string[];
}

export const validateReminderSettings = (
  settings: ReminderSettings
): { valid: boolean; error?: string } => {
  if (!settings.reminder_times || !Array.isArray(settings.reminder_times)) {
    return { valid: false, error: "Invalid reminder times format" };
  }

  return validateReminderTimes(settings.reminder_times);
};

/**
 * Gets the next reminder time for a patient
 * @param reminderTimes - Array of reminder times
 * @returns Next upcoming reminder time or null if none today
 */
export const getNextReminderTime = (reminderTimes: string[]): string | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = sortReminderTimes(reminderTimes);

  for (const time of sorted) {
    const [hour, minute] = time.split(":").map(Number);
    const timeMinutes = hour * 60 + minute;

    if (timeMinutes > currentMinutes) {
      return time;
    }
  }

  return null; // No more reminders today
};

/**
 * Calculates time until next reminder
 * @param reminderTimes - Array of reminder times
 * @returns Time remaining in minutes or null
 */
export const getMinutesUntilNextReminder = (reminderTimes: string[]): number | null => {
  const nextTime = getNextReminderTime(reminderTimes);
  if (!nextTime) return null;

  const now = new Date();
  const [hour, minute] = nextTime.split(":").map(Number);
  const nextDate = new Date();
  nextDate.setHours(hour, minute, 0, 0);

  const diff = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60));
  return Math.max(0, diff);
};
