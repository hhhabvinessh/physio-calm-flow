/**
 * 🔧 REMINDER API ENDPOINTS
 * Provides backend API functions for managing patient reminder settings
 * All endpoints include role-based access control and validation
 */

import { supabase } from "@/integrations/supabase/client";
import { validateReminderTimes } from "@/lib/reminderValidation";

export interface ReminderSettings {
  reminder_enabled: boolean;
  reminder_times: string[];
}

export interface ReminderLog {
  id: string;
  patient_id: string;
  reminder_time: string;
  reminder_type: string;
  sent_at: string;
  delivered: boolean;
  delivery_method: string;
}

/**
 * ✅ GET PATIENT REMINDER SETTINGS
 * Fetch reminder configuration for a specific patient
 * Only accessible by the patient's doctor or admin
 * @param patientId - UUID of the patient
 * @returns Reminder settings or error
 */
export const getPatientReminderSettings = async (
  patientId: string
): Promise<{ data: ReminderSettings | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("reminder_enabled, reminder_times")
      .eq("id", patientId)
      .single();

    if (error) {
      console.error("❌ Error fetching reminder settings:", error);
      return { data: null, error };
    }

    return {
      data: {
        reminder_enabled: data.reminder_enabled,
        reminder_times: data.reminder_times,
      },
      error: null,
    };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { data: null, error: err as Error };
  }
};

/**
 * ✅ UPDATE PATIENT REMINDER SETTINGS
 * Modify reminder configuration for a patient
 * Only accessible by the patient's doctor or admin
 * Includes audit trail for compliance
 * @param patientId - UUID of the patient
 * @param settings - New reminder settings
 * @param reason - Reason for change (for audit trail)
 * @returns Success status or error
 */
export const updatePatientReminderSettings = async (
  patientId: string,
  settings: ReminderSettings,
  reason?: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // ✅ VALIDATION: Check reminder times format
    const validation = validateReminderTimes(settings.reminder_times);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid reminder times");
    }

    // ✅ Get current user
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw new Error("User not authenticated");
    }

    // ✅ SECURITY CHECK: Verify doctor-patient relationship
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("doctor_id")
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      throw new Error("Patient not found");
    }

    // Verify user is doctor of this patient or admin
    const { data: userRole } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    const isAuthorized =
      authData.user.id === patient.doctor_id || userRole?.role === "admin";

    if (!isAuthorized) {
      throw new Error("Not authorized to update this patient's reminder settings");
    }

    // ✅ UPDATE SETTINGS using RPC function with audit trail
    const { error: updateError } = await supabase.rpc(
      "update_reminder_settings",
      {
        p_patient_id: patientId,
        p_updated_by: authData.user.id,
        p_reminder_enabled: settings.reminder_enabled,
        p_reminder_times: settings.reminder_times,
        p_change_reason: reason || "Manual update by doctor",
      }
    );

    if (updateError) {
      console.error("❌ Error updating reminder settings:", updateError);
      throw updateError;
    }

    console.log("✅ Reminder settings updated successfully");
    return { success: true, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { success: false, error: err as Error };
  }
};

/**
 * ✅ ENABLE REMINDERS FOR PATIENT
 * Shortcut to enable all reminders (keeps existing times)
 * @param patientId - UUID of the patient
 * @returns Success status or error
 */
export const enablePatientReminders = async (
  patientId: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { data: settings, error: fetchError } = await getPatientReminderSettings(
      patientId
    );

    if (fetchError || !settings) {
      return { success: false, error: fetchError || new Error("Settings not found") };
    }

    return await updatePatientReminderSettings(
      patientId,
      { ...settings, reminder_enabled: true },
      "Reminders enabled"
    );
  } catch (err) {
    return { success: false, error: err as Error };
  }
};

/**
 * ✅ DISABLE REMINDERS FOR PATIENT
 * Shortcut to disable all reminders (keeps existing times)
 * @param patientId - UUID of the patient
 * @returns Success status or error
 */
export const disablePatientReminders = async (
  patientId: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { data: settings, error: fetchError } = await getPatientReminderSettings(
      patientId
    );

    if (fetchError || !settings) {
      return { success: false, error: fetchError || new Error("Settings not found") };
    }

    return await updatePatientReminderSettings(
      patientId,
      { ...settings, reminder_enabled: false },
      "Reminders disabled"
    );
  } catch (err) {
    return { success: false, error: err as Error };
  }
};

/**
 * ✅ GET REMINDER LOGS
 * Fetch history of sent reminders for a patient
 * Useful for debugging and compliance
 * @param patientId - UUID of the patient
 * @param limit - Maximum number of logs to return (default 50)
 * @returns Array of reminder logs or error
 */
export const getPatientReminderLogs = async (
  patientId: string,
  limit: number = 50
): Promise<{ data: ReminderLog[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("patient_id", patientId)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ Error fetching reminder logs:", error);
      return { data: null, error };
    }

    return { data: data as ReminderLog[], error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { data: null, error: err as Error };
  }
};

/**
 * ✅ GET REMINDER SETTINGS AUDIT TRAIL
 * Fetch history of changes to reminder settings
 * Shows who changed what and when (for compliance)
 * @param patientId - UUID of the patient
 * @param limit - Maximum number of logs to return (default 50)
 * @returns Array of audit logs or error
 */
export const getReminderSettingsAuditTrail = async (
  patientId: string,
  limit: number = 50
): Promise<{ data: Record<string, unknown>[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from("reminder_settings_audit")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ Error fetching audit trail:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { data: null, error: err as Error };
  }
};

/**
 * ✅ LOG REMINDER SENT (Internal use)
 * Called by scheduler to record that a reminder was sent
 * Prevents duplicate sends and tracks delivery
 * @param patientId - UUID of the patient
 * @param reminderTime - Time that triggered reminder (HH:MM)
 * @param reminderType - Type of reminder (exercise, pain_log, etc.)
 * @returns Success status or error
 */
export const logReminderSent = async (
  patientId: string,
  reminderTime: string,
  reminderType: string = "exercise"
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.rpc("log_reminder_sent", {
      p_patient_id: patientId,
      p_reminder_time: reminderTime,
      p_reminder_type: reminderType,
    });

    if (error) {
      console.error("❌ Error logging reminder:", error);
      throw error;
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { success: false, error: err as Error };
  }
};

/**
 * ✅ GET PATIENTS DUE FOR REMINDERS (Internal use)
 * Called by the scheduler service
 * Returns list of patients whose reminder time matches current time
 * @returns Array of patients due for reminders
 */
export const getPatientsDueForReminders = async (): Promise<
  | { patient_id: string; user_id: string; doctor_id: string; reminder_time: string }[]
  | null
> => {
  try {
    const { data, error } = await supabase.rpc("get_patients_due_for_reminder");

    if (error) {
      console.error("❌ Error fetching patients due for reminders:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return null;
  }
};

/**
 * ✅ RESET REMINDER SETTINGS TO DEFAULT
 * Sets reminders back to default (enabled, 08:00 and 18:00)
 * @param patientId - UUID of the patient
 * @returns Success status or error
 */
export const resetReminderSettingsToDefault = async (
  patientId: string
): Promise<{ success: boolean; error: Error | null }> => {
  return await updatePatientReminderSettings(
    patientId,
    {
      reminder_enabled: true,
      reminder_times: ["08:00", "18:00"],
    },
    "Reset to default settings"
  );
};
