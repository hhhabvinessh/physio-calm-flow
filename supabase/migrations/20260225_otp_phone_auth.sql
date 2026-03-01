-- Add phone number and role to profiles table for OTP authentication
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS otp_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0;

-- Update role enum to include admin
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT typeid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number);

-- Update RLS policies for OTP auth
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR phone_number = auth.phone() OR phone_number IS NOT NULL);

-- Allow unauthenticated users to read profile by phone (for OTP verification)
CREATE POLICY "Unauthenticated can verify OTP by phone"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Helper function to generate OTP
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Helper function to send OTP (placeholder - integrate with SMS provider)
CREATE OR REPLACE FUNCTION public.send_otp_to_phone(phone_number TEXT)
RETURNS JSON AS $$
DECLARE
  otp_code TEXT;
  result JSON;
BEGIN
  -- Generate OTP
  otp_code := public.generate_otp();
  
  -- Store OTP with 5-minute expiry
  UPDATE public.profiles
  SET 
    otp_code = otp_code,
    otp_expires_at = NOW() + INTERVAL '5 minutes',
    otp_attempts = 0
  WHERE phone_number = phone_number;
  
  -- TODO: Send OTP via SMS (integrate with Twilio, AWS SNS, etc.)
  -- PERFORM send_sms(phone_number, 'Your OTP is: ' || otp_code);
  
  -- For development: return OTP in response
  result := json_build_object(
    'success', true,
    'message', 'OTP sent to ' || phone_number,
    'otp_code', otp_code -- Remove in production!
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(phone_number TEXT, otp_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, user_id UUID, role TEXT) AS $$
DECLARE
  stored_otp TEXT;
  otp_exp TIMESTAMPTZ;
  attempts INT;
  user_id_var UUID;
  user_role TEXT;
BEGIN
  -- Fetch OTP and attempts
  SELECT profiles.otp_code, profiles.otp_expires_at, profiles.otp_attempts, profiles.id, profiles.role
  INTO stored_otp, otp_exp, attempts, user_id_var, user_role
  FROM public.profiles
  WHERE phone_number = phone_number;
  
  -- Check if too many attempts
  IF attempts >= 5 THEN
    RETURN QUERY SELECT false, 'Too many attempts. Please try again after 5 minutes.', NULL::UUID, NULL;
    RETURN;
  END IF;
  
  -- Check if OTP expired
  IF otp_exp IS NULL OR NOW() > otp_exp THEN
    RETURN QUERY SELECT false, 'OTP has expired. Please request a new one.', NULL::UUID, NULL;
    RETURN;
  END IF;
  
  -- Check if OTP matches
  IF stored_otp != otp_code THEN
    UPDATE public.profiles SET otp_attempts = attempts + 1 WHERE phone_number = phone_number;
    RETURN QUERY SELECT false, 'Incorrect OTP. Please try again.', NULL::UUID, NULL;
    RETURN;
  END IF;
  
  -- OTP is valid - clear it
  UPDATE public.profiles
  SET otp_code = NULL, otp_attempts = 0, otp_expires_at = NULL
  WHERE phone_number = phone_number;
  
  RETURN QUERY SELECT true, 'OTP verified successfully', user_id_var, user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
