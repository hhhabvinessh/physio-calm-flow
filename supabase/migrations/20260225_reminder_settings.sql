-- Add reminder settings to patients table
-- Migration: Professional Reminder System
-- Adds reminder_enabled and reminder_times to track patient notification preferences

-- ✅ ALTER PATIENTS TABLE TO ADD REMINDER SETTINGS
ALTER TABLE public.patients 
ADD COLUMN reminder_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN reminder_times TEXT[] NOT NULL DEFAULT ARRAY['08:00', '18:00'],
ADD COLUMN last_reminder_sent_at TIMESTAMPTZ,
ADD COLUMN last_reminder_type TEXT;

-- ✅ CREATE REMINDER SETTINGS TABLE FOR AUDIT & HISTORY
-- This table tracks changes to reminder settings for security and compliance
CREATE TABLE public.reminder_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  modified_by UUID NOT NULL REFERENCES auth.users(id),
  old_reminder_enabled BOOLEAN,
  new_reminder_enabled BOOLEAN,
  old_reminder_times TEXT[],
  new_reminder_times TEXT[],
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminder_settings_audit ENABLE ROW LEVEL SECURITY;

-- ✅ CREATE REMINDER LOG TABLE (for tracking sent notifications)
-- This helps prevent duplicate sends and track delivery
CREATE TABLE public.reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reminder_time TEXT NOT NULL, -- HH:MM format that triggered this
  reminder_type TEXT NOT NULL DEFAULT 'exercise', -- exercise, pain_log, assignment, etc.
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered BOOLEAN DEFAULT true,
  delivery_method TEXT DEFAULT 'browser', -- browser, sms, email, in-app
  notes TEXT
);
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- ✅ VALIDATION FUNCTION: CHECK REMINDER TIMES FORMAT
CREATE OR REPLACE FUNCTION public.validate_reminder_times(reminder_times TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  time_item TEXT;
BEGIN
  -- Check if array is empty (return true - empty is valid default)
  IF reminder_times IS NULL OR array_length(reminder_times, 1) IS NULL THEN
    RETURN true;
  END IF;

  -- Check max 3 times
  IF array_length(reminder_times, 1) > 3 THEN
    RETURN false;
  END IF;

  -- Check each time format is HH:MM and valid
  FOREACH time_item IN ARRAY reminder_times LOOP
    -- Check format matches HH:MM
    IF time_item !~ '^\d{2}:\d{2}$' THEN
      RETURN false;
    END IF;
    
    -- Check hour is 0-23, minute is 0-59
    IF (split_part(time_item, ':', 1)::INT < 0 OR split_part(time_item, ':', 1)::INT > 23) THEN
      RETURN false;
    END IF;
    IF (split_part(time_item, ':', 2)::INT < 0 OR split_part(time_item, ':', 2)::INT > 59) THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$;

-- ✅ TRIGGER: VALIDATE REMINDER TIMES ON UPDATE
ALTER TABLE public.patients 
ADD CONSTRAINT check_reminder_times CHECK (
  validate_reminder_times(reminder_times)
);

-- ✅ HELPER FUNCTION: GET PATIENTS DUE FOR REMINDERS
-- Query all patients who:
-- 1. Have reminders enabled
-- 2. Current time matches one of their reminder_times
-- 3. Haven't received a reminder in the last minute (prevent duplicates)
CREATE OR REPLACE FUNCTION public.get_patients_due_for_reminder()
RETURNS TABLE (
  patient_id UUID,
  user_id UUID,
  doctor_id UUID,
  reminder_time TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.doctor_id,
    time_value
  FROM public.patients p
  CROSS JOIN LATERAL unnest(p.reminder_times) AS time_value
  WHERE 
    p.reminder_enabled = true
    AND to_char(now() AT TIME ZONE 'UTC', 'HH24:MI') = time_value
    AND (
      p.last_reminder_sent_at IS NULL 
      OR p.last_reminder_sent_at < now() - INTERVAL '1 minute'
    );
$$;

-- ✅ HELPER FUNCTION: CHECK IF PATIENT HAS COMPLETED EXERCISES TODAY
-- Returns true if patient has already completed their exercises for this session
CREATE OR REPLACE FUNCTION public.has_completed_exercises_today(p_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.exercise_completions
    WHERE patient_id = p_patient_id
    AND completed_at::DATE = CURRENT_DATE
  );
$$;

-- ✅ HELPER FUNCTION: LOG REMINDER SENT
-- Records that a reminder was sent to a patient
CREATE OR REPLACE FUNCTION public.log_reminder_sent(
  p_patient_id UUID,
  p_reminder_time TEXT,
  p_reminder_type TEXT DEFAULT 'exercise'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update last sent time
  UPDATE public.patients
  SET 
    last_reminder_sent_at = now(),
    last_reminder_type = p_reminder_type
  WHERE id = p_patient_id;

  -- Log the reminder
  INSERT INTO public.reminder_logs (patient_id, reminder_time, reminder_type)
  VALUES (p_patient_id, p_reminder_time, p_reminder_type);
END;
$$;

-- ✅ HELPER FUNCTION: UPDATE REMINDER SETTINGS (with audit trail)
CREATE OR REPLACE FUNCTION public.update_reminder_settings(
  p_patient_id UUID,
  p_updated_by UUID,
  p_reminder_enabled BOOLEAN,
  p_reminder_times TEXT[],
  p_change_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_enabled BOOLEAN;
  old_times TEXT[];
BEGIN
  -- Validate input
  IF NOT public.validate_reminder_times(p_reminder_times) THEN
    RAISE EXCEPTION 'Invalid reminder times format';
  END IF;

  -- Get old values
  SELECT reminder_enabled, reminder_times 
  INTO old_enabled, old_times
  FROM public.patients 
  WHERE id = p_patient_id;

  -- Update patient settings
  UPDATE public.patients
  SET 
    reminder_enabled = p_reminder_enabled,
    reminder_times = p_reminder_times
  WHERE id = p_patient_id;

  -- Log to audit trail
  INSERT INTO public.reminder_settings_audit (
    patient_id, 
    modified_by, 
    old_reminder_enabled, 
    new_reminder_enabled,
    old_reminder_times,
    new_reminder_times,
    change_reason
  )
  VALUES (
    p_patient_id,
    p_updated_by,
    old_enabled,
    p_reminder_enabled,
    old_times,
    p_reminder_times,
    p_change_reason
  );
END;
$$;

-- ✅ RLS POLICIES FOR REMINDER SETTINGS AUDIT
CREATE POLICY "Doctors can view audit logs for their patients"
  ON public.reminder_settings_audit FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update reminder settings for their patients"
  ON public.reminder_settings_audit FOR INSERT
  WITH CHECK (
    modified_by = auth.uid()
    AND patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

-- ✅ RLS POLICIES FOR REMINDER LOGS
CREATE POLICY "Doctors can view reminder logs for their patients"
  ON public.reminder_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view their own reminder logs"
  ON public.reminder_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ✅ CREATE INDEX FOR PERFORMANCE
CREATE INDEX idx_patients_reminder_enabled ON public.patients(reminder_enabled);
CREATE INDEX idx_reminder_logs_patient_created ON public.reminder_logs(patient_id, created_at);
CREATE INDEX idx_reminder_settings_audit_patient ON public.reminder_settings_audit(patient_id, created_at);
