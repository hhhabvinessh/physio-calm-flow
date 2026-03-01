# 🚀 Quick Start Guide - OTP Phone Authentication

**For Developers**: Get up and running in 5 minutes

---

## 📖 What Changed (TL;DR)

| Before | After |
|--------|-------|
| Email + Password | Phone Number + SMS OTP |
| Public signup | Clinic-managed users only |
| Manual role selection | Auto-redirect by role |
| Client-side role check | Server-side validation |

---

## 🎯 3-Minute Overview

### The New Flow
```
User Login Page
    ↓
Enter Phone: 310-555-1234
    ↓
Get SMS with OTP code: 123456
    ↓
Enter OTP
    ↓
[Server validates role from database]
    ↓
Auto-redirect:
  • Admin → /admin-dashboard
  • Doctor → /doctor/dashboard
  • Patient → /patient/home
```

### Key Components
```
AuthContext.tsx
  • requestOTP(phoneNumber) → Sends OTP
  • verifyOTP(phoneNumber, otp) → Validates & gets role

Login.tsx
  • Step 1: Phone number entry
  • Step 2: OTP code entry

ProtectedRoute.tsx
  • requiredRole="doctor" → Only doctors can access
  • Wrong role → Redirects to correct dashboard
```

---

## 🔧 Setup (5 Steps)

### 1. Run Database Migration
```bash
# Via CLI
supabase db push

# Or manually copy-paste in Supabase SQL editor:
# File: supabase/migrations/20260225_otp_phone_auth.sql
```

### 2. Add Users (SQL)
```sql
-- Create user in Auth (via Supabase Dashboard)

-- Then add to profiles table:
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT id, email, phone, 'doctor', 'Dr. Jane Smith'
FROM auth.users
WHERE phone = '+13105551234'
LIMIT 1;
```

### 3. Configure SMS Provider
Go to Supabase → Authentication → SMS Provider:
- Connect Twilio or AWS SNS
- Test sending SMS

### 4. Deploy Code
```bash
npm run build
# Deploy to Vercel/Netlify/your host
```

### 5. Test Login
- Phone: Enter registered number
- OTP: Check SMS (or browser console in dev mode)
- Should redirect to dashboard

---

## 💻 For Developers

### Import & Use AuthContext
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { role, phoneNumber, requestOTP, verifyOTP, signOut } = useAuth();

  // Your code...
}
```

### Create Protected Route
```tsx
import ProtectedRoute from "@/components/ProtectedRoute";
import { DoctorDashboard } from "./DoctorDashboard";

export default function App() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  );
}
```

### Check User Role
```tsx
const { role } = useAuth();

if (role === "doctor") {
  // Show doctor UI
} else if (role === "patient") {
  // Show patient UI
} else if (role === "admin") {
  // Show admin UI
}
```

### Logout
```tsx
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  // User redirected to login automatically
};
```

---

## 📞 For Clinic Admin

### Register a New Patient
```sql
-- Copy this template to Supabase SQL Editor

INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'patient@clinic.com', 
  '+13105551234',
  'patient',
  'John Doe'
FROM auth.users
WHERE phone = '+13105551234'
LIMIT 1;
```

### Register a New Doctor
```sql
INSERT INTO public.profiles (id, email, phone_number, role, full_name)
SELECT 
  id, 
  'doctor@clinic.com', 
  '+13105559999',
  'doctor',
  'Dr. Sarah Smith'
FROM auth.users
WHERE phone = '+13105559999'
LIMIT 1;
```

### View All Users
```sql
SELECT phone_number, full_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
```

### Change User Role
```sql
UPDATE public.profiles
SET role = 'doctor'
WHERE phone_number = '+13105551234';
```

---

## 🧪 Quick Test

### Test Case 1: Unregistered User
```
Phone: 999-999-9999
Expected: "This number is not registered. Please contact clinic."
```

### Test Case 2: Registered Patient
```
Phone: [patient phone from database]
OTP: [Check SMS or console in dev mode]
Expected: Redirects to /patient/home
```

### Test Case 3: Registered Doctor
```
Phone: [doctor phone from database]
OTP: [Check SMS or console]
Expected: Redirects to /doctor/dashboard
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth logic (OTP) |
| `src/pages/Login.tsx` | Login UI (phone + OTP) |
| `src/components/ProtectedRoute.tsx` | Route protection |
| `src/App.tsx` | App routing |
| `supabase/migrations/20260225_otp_phone_auth.sql` | Database schema |

---

## 🐛 Quick Troubleshooting

### "This number is not registered"
**Problem**: User not in profiles table  
**Fix**: Add user with SQL template above  

### "Incorrect OTP"
**Problem**: Wrong code entered  
**Fix**: Check SMS or browser console (dev mode)  

### User redirects to wrong dashboard
**Problem**: Role incorrect in database  
**Fix**: Update role in profiles table  

### OTP not received on phone
**Problem**: SMS provider not configured  
**Fix**: Set up Twilio/AWS SNS in Supabase  

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│ Frontend (React)                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Login.tsx                                   │ │
│ │ ├─ Step 1: Phone input                      │ │
│ │ └─ Step 2: OTP input                        │ │
│ │                                               │ │
│ │ ProtectedRoute.tsx                          │ │
│ │ └─ RBAC enforcement                         │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↓ API Calls
┌─────────────────────────────────────────────────┐
│ Supabase Backend                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Auth OTP (SMS Provider)                     │ │
│ │ ├─ Send OTP to phone                        │ │
│ │ └─ Verify OTP                               │ │
│ │                                               │ │
│ │ Database (profiles table)                   │ │
│ │ ├─ phone_number (UNIQUE)                    │ │
│ │ ├─ role (admin/doctor/patient)              │ │
│ │ └─ otp_code, otp_expires_at                 │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

- [ ] Database migration executed
- [ ] Users added to profiles table with phone + role
- [ ] SMS provider configured (Twilio/AWS SNS)
- [ ] Code deployed
- [ ] Test login (all 3 roles)
- [ ] Test unregistered user error
- [ ] Test role-based redirect
- [ ] Test OTP expiry
- [ ] Test brute force (5+ wrong OTPs)
- [ ] Verify security (no passwords in database)

---

## 🎓 For Questions

1. **Technical Details?** → See `OTP_PHONE_AUTH_IMPLEMENTATION.md`
2. **Admin / SQL?** → See `CLINIC_ADMIN_USER_MANAGEMENT_GUIDE.md`
3. **Full Summary?** → See `IMPLEMENTATION_SUMMARY.md`

---

## 🚀 Go Live Checklist

```
Pre-Launch:
  [ ] Database migration applied to production
  [ ] All users registered with phone + role
  [ ] SMS provider tested and working
  [ ] Staging environment tested (all 3 roles)

Launch:
  [ ] Deploy code to production
  [ ] Smoke test (doctor + patient login)
  [ ] Monitor error logs
  [ ] Have rollback plan ready

Post-Launch:
  [ ] Monitor OTP success rate
  [ ] Check for unregistered phone attempts
  [ ] Gather user feedback
  [ ] Track login times
```

---

**Status**: ✅ Ready for Dev/Staging/Production  
**Time to Deploy**: 30 minutes  
**Breaking Changes**: Yes (complete auth redesign)  
**Rollback Plan**: Keep old database backup

Questions? Check documentation files in project root. 📚
