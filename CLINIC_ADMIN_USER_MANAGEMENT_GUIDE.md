# 👨‍⚕️ Clinic Administrator Guide - User Management

## Quick Reference: Adding Users to PhysioCare

---

## 📋 User Registration Workflow

### Step 1: Create Supabase Auth User (One-time setup)

**Via Supabase Dashboard → Authentication → Users:**

1. Click "Add User"
2. Enter phone number: `+1` (country code) + phone
3. Click "Create User"

**OR via SQL:**
```sql
SELECT auth.create_user(
  email => 'patient@clinic.com'::text,
  phone => '+1234567890'::text
);
```

### Step 2: Add User to `profiles` Table

**Via SQL (Recommended):**

```sql
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  email, 
  phone, 
  'patient',  -- Change to: doctor, admin
  'Full Name Here'
FROM auth.users
WHERE phone = '+1234567890'
AND id NOT IN (SELECT id FROM public.profiles);
```

**Via Supabase Dashboard → SQL Editor:**

1. Copy & paste one of the examples below
2. Replace values in CAPITALS
3. Run query
4. Verify in `profiles` table

---

## 👥 User Registration Templates

### Template 1: Register a NEW Patient

```sql
-- Step 1: Create in auth.users (auto-creates user)
-- Via Supabase Dashboard Auth tab (manual)

-- Step 2: Add to profiles table
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'PATIENT_EMAIL@clinic.com', 
  '+PHONE_NUMBER',  -- Example: +13105551234
  'patient',
  'PATIENT_FULL_NAME'
FROM auth.users
WHERE phone = '+PHONE_NUMBER'
AND id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;
```

**Example:**
```sql
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'john.doe@clinic.com', 
  '+13105551234',
  'patient',
  'John Doe'
FROM auth.users
WHERE phone = '+13105551234'
AND id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;
```

---

### Template 2: Register a NEW Doctor

```sql
-- Step 1: Create in auth.users (manual via Supabase Dashboard)

-- Step 2: Add to profiles table
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'DR_EMAIL@clinic.com', 
  '+DR_PHONE_NUMBER',  -- Example: +13105559999
  'doctor',
  'DR. FULL NAME'
FROM auth.users
WHERE phone = '+DR_PHONE_NUMBER'
AND id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;
```

**Example:**
```sql
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'dr.smith@clinic.com', 
  '+13105559999',
  'doctor',
  'Dr. Sarah Smith'
FROM auth.users
WHERE phone = '+13105559999'
AND id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;
```

---

### Template 3: Register an Admin

```sql
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'ADMIN_EMAIL@clinic.com', 
  '+ADMIN_PHONE',
  'admin',
  'ADMIN FULL NAME'
FROM auth.users
WHERE phone = '+ADMIN_PHONE'
AND id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;
```

---

### Template 4: Register Multiple Users (Bulk)

```sql
-- Add multiple users at once
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  au.id, 
  au.email, 
  au.phone,
  CASE 
    WHEN au.phone IN ('+13105551111', '+13105552222') THEN 'doctor'
    ELSE 'patient'
  END,
  au.raw_user_meta_data->>'full_name'
FROM auth.users au
WHERE au.phone IS NOT NULL
AND au.id NOT IN (SELECT id FROM public.profiles);
```

---

## ✏️ User Management Operations

### Change User Role

```sql
UPDATE public.profiles
SET role = 'doctor'
WHERE phone_number = '+13105551234';
```

### Change User Phone Number

⚠️ **WARNING**: Phone number is primary login identifier!

```sql
UPDATE public.profiles
SET phone_number = '+13105552222'
WHERE phone_number = '+13105551111';
```

### View All Users

```sql
SELECT 
  id,
  phone_number,
  role,
  full_name,
  email,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
```

### View Users by Role

```sql
-- All Doctors
SELECT * FROM public.profiles WHERE role = 'doctor';

-- All Patients
SELECT * FROM public.profiles WHERE role = 'patient';

-- All Admins
SELECT * FROM public.profiles WHERE role = 'admin';
```

### Deactivate User (Delete)

```sql
DELETE FROM public.profiles
WHERE phone_number = '+13105551234';
```

### Find User by Phone

```sql
SELECT * FROM public.profiles
WHERE phone_number = '+13105551234';
```

### Find User by Email

```sql
SELECT * FROM public.profiles
WHERE email = 'patient@clinic.com';
```

---

## 🔐 Reset User OTP (After Failed Attempts)

If user is locked out after 5 failed OTP attempts:

```sql
UPDATE public.profiles
SET 
  otp_code = NULL,
  otp_attempts = 0,
  otp_expires_at = NULL
WHERE phone_number = '+13105551234';
```

---

## 📊 Common Workflows

### Workflow 1: Onboard New Patient

**Day 1: Clinic Admin**
1. Create user in Supabase Auth with phone number
2. Run insert query to add to profiles

**Login: Patient**
1. Opens app → Click Login
2. Enters phone number: `310-555-1234`
3. Receives OTP on phone
4. Enters OTP → Auto-redirects to `/patient/home`

---

### Workflow 2: Add New Doctor

**Day 1: Clinic Admin**
1. Create user in Supabase Auth with phone
2. Run insert query with role='doctor'

**Login: Doctor**
1. Opens app → Click Login
2. Enters phone: `310-555-9999`
3. Enters OTP → Auto-redirects to `/doctor/dashboard`

---

### Workflow 3: Patient Assigned Exercise

**Doctor Action**:
1. Login as doctor
2. Add patient
3. Assign exercises + reps/sets
4. Save plan

**Patient Action**:
1. Login with phone + OTP
2. See assigned exercises in `/patient/home`
3. Complete exercise
4. See progress in `/patient/pain-log`

---

## 🆘 Troubleshooting

### Problem: User not found after clicking "Send OTP"

**Solution**: User not in `profiles` table

```sql
-- Check if user exists
SELECT * FROM public.profiles
WHERE phone_number = '+13105551234';

-- If empty, insert user:
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT id, email, phone, 'patient', 'John Doe'
FROM auth.users
WHERE phone = '+13105551234'
LIMIT 1;
```

---

### Problem: "OTP too many attempts"

**Solution**: Reset OTP counter

```sql
UPDATE public.profiles
SET otp_attempts = 0
WHERE phone_number = '+13105551234';
```

---

### Problem: User gets wrong dashboard

**Solution**: Check role in database

```sql
SELECT phone_number, role FROM public.profiles
WHERE phone_number = '+13105551234';

-- Fix if needed:
UPDATE public.profiles
SET role = 'doctor'
WHERE phone_number = '+13105551234';
```

---

### Problem: User not seeing their patients (Doctor)

**Solution**: Verify doctor is assigned as owner

```sql
-- Check patient-doctor relationship
SELECT p.full_name, pa.doctor_id, doc.full_name as doctor_name
FROM public.patients p
JOIN public.profiles doc ON p.doctor_id = doc.id
WHERE p.doctor_id = 'DOCTOR_USER_ID';
```

---

## 📞 Phone Number Formats

**Accepted formats** (all converted to same format internally):

| Format | Example |
|--------|---------|
| Full | +1-310-555-1234 |
| No country code | 310-555-1234 |
| No dashes | 3105551234 |
| With spaces | 310 555 1234 |

**Store in database as**: `+CCNNNNNNNNN` (e.g., `+13105551234`)

---

## ✅ Verification Checklist

After adding a user:

- [ ] User exists in `auth.users` table
- [ ] User exists in `profiles` table
- [ ] Phone number is correct and unique
- [ ] Role is set (doctor/patient/admin)
- [ ] User can login with phone number
- [ ] OTP received on phone (or shown in console for dev)
- [ ] User redirected to correct dashboard after OTP
- [ ] Doctor can see assigned patients
- [ ] Patient can see assigned exercises

---

## 🎯 Daily Operations

### Morning Setup: Verify All Users Active

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
  COUNT(CASE WHEN role = 'patient' THEN 1 END) as patients,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM public.profiles;
```

### Check for Locked-Out Users

```sql
SELECT phone_number, otp_attempts, otp_expires_at
FROM public.profiles
WHERE otp_attempts >= 5
  AND otp_expires_at > NOW();
```

### Export User List (for reports)

```sql
SELECT 
  phone_number,
  full_name,
  role,
  email,
  created_at
FROM public.profiles
ORDER BY role, created_at;
```

---

## 💡 Pro Tips

1. **Keep phone numbers consistent** - Always use +1-XXX-XXX-XXXX format
2. **Document user registration** - Keep spreadsheet of clinic users
3. **Backup user list** - Export regularly
4. **Test login flow** - New user should test immediately after registration
5. **Monitor OTP failures** - High failures = potential security issue

---

**Last Updated**: February 25, 2026  
**System Version**: 1.0  
**Status**: Production-Ready
