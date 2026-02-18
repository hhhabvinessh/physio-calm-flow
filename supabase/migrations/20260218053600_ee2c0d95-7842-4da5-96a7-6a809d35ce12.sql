
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'patient');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Patients table (links patient to their doctor)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INT,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  diagnosis TEXT,
  login_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Exercises library
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Exercise plans (assigned exercises to patients)
CREATE TABLE public.exercise_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INT NOT NULL DEFAULT 3,
  reps INT NOT NULL DEFAULT 12,
  rest_seconds INT NOT NULL DEFAULT 30,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercise_plans ENABLE ROW LEVEL SECURITY;

-- Exercise completions
CREATE TABLE public.exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_plan_id UUID NOT NULL REFERENCES public.exercise_plans(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

-- Pain logs
CREATE TABLE public.pain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level >= 0 AND level <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pain_logs ENABLE ROW LEVEL SECURITY;

-- ========== HELPER FUNCTIONS ==========

-- Check if user has a specific role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get patient record for current user
CREATE OR REPLACE FUNCTION public.get_patient_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.patients WHERE user_id = _user_id LIMIT 1
$$;

-- Check if current user is doctor of a given patient
CREATE OR REPLACE FUNCTION public.is_doctor_of_patient(_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = _patient_id AND doctor_id = auth.uid()
  )
$$;

-- ========== TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Auto-assign role from metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS POLICIES ==========

-- Profiles: users can read their own, doctors can read their patients' profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- User roles: users can read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Patients: doctors see their own patients, patients see their own record
CREATE POLICY "Doctors can view their patients"
  ON public.patients FOR SELECT
  USING (doctor_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Doctors can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = auth.uid());

CREATE POLICY "Doctors can update their patients"
  ON public.patients FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete their patients"
  ON public.patients FOR DELETE
  USING (doctor_id = auth.uid());

-- Exercises: readable by all authenticated users
CREATE POLICY "Exercises are readable by authenticated users"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can create exercises"
  ON public.exercises FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'doctor'));

-- Exercise plans: doctors see plans they assigned, patients see their own
CREATE POLICY "View exercise plans"
  ON public.exercise_plans FOR SELECT
  USING (
    assigned_by = auth.uid() 
    OR public.is_doctor_of_patient(patient_id)
    OR patient_id = public.get_patient_id_for_user(auth.uid())
  );

CREATE POLICY "Doctors can create exercise plans"
  ON public.exercise_plans FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'doctor') 
    AND public.is_doctor_of_patient(patient_id)
    AND assigned_by = auth.uid()
  );

CREATE POLICY "Doctors can update their exercise plans"
  ON public.exercise_plans FOR UPDATE
  USING (assigned_by = auth.uid());

CREATE POLICY "Doctors can delete their exercise plans"
  ON public.exercise_plans FOR DELETE
  USING (assigned_by = auth.uid());

-- Exercise completions
CREATE POLICY "View exercise completions"
  ON public.exercise_completions FOR SELECT
  USING (
    patient_id = public.get_patient_id_for_user(auth.uid())
    OR public.is_doctor_of_patient(patient_id)
  );

CREATE POLICY "Patients can create completions"
  ON public.exercise_completions FOR INSERT
  WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));

-- Pain logs
CREATE POLICY "View pain logs"
  ON public.pain_logs FOR SELECT
  USING (
    patient_id = public.get_patient_id_for_user(auth.uid())
    OR public.is_doctor_of_patient(patient_id)
  );

CREATE POLICY "Patients can create pain logs"
  ON public.pain_logs FOR INSERT
  WITH CHECK (patient_id = public.get_patient_id_for_user(auth.uid()));

-- ========== SEED EXERCISES ==========
INSERT INTO public.exercises (name, description) VALUES
  ('Straight Leg Raises', 'Lie on your back, keep one leg straight and raise it slowly.'),
  ('Wall Squats', 'Stand with your back against a wall, slowly slide down to a sitting position.'),
  ('Hamstring Curls', 'Stand and slowly bend one knee, bringing your heel toward your buttocks.'),
  ('Calf Stretches', 'Stand facing a wall, place hands on wall and stretch one calf at a time.'),
  ('Quad Sets', 'Sit with legs extended, tighten the muscles on top of your thigh.'),
  ('Shoulder Pendulums', 'Bend forward slightly, let arm hang and swing gently in circles.');
