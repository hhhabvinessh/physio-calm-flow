# 📊 Visual Reference - OTP Authentication System

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER VISITS APP                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            RoleSelection.tsx (Auto-Router)                  │
│                                                              │
│  Check: Is user logged in?                                  │
└────────────┬──────────────────────────────┬────────────────┘
             │                              │
             ▼ YES                          ▼ NO
    ┌─────────────────┐          ┌──────────────────────┐
    │ Fetch role from │          │   Redirect to        │
    │ database        │          │   /login             │
    └────────┬────────┘          └──────────────────────┘
             │
             ├─ admin ────────────► /admin-dashboard
             ├─ doctor ───────────► /doctor/dashboard
             └─ patient ─────────► /patient/home
```

---

## Login Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      Login.tsx - STEP 1                          │
│                                                                   │
│              Enter Phone Number                                  │
│              [123-456-7890]                                      │
│              [Send OTP Button]                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Check database for phone   │
              │  Does it exist?             │
              └──┬──────────────────────┬───┘
                 │ NO                   │ YES
                 ▼                      ▼
         ┌───────────────┐    ┌──────────────────┐
         │ Error Message:│    │ Send OTP via SMS │
         │ "Not          │    │ (or console)     │
         │ registered.   │    └────────┬─────────┘
         │ Contact       │             │
         │ clinic."      │             ▼
         └───────────────┘  ┌──────────────────────────┐
                            │  Login.tsx - STEP 2      │
                            │                          │
                            │  Enter OTP Code          │
                            │  [123456]                │
                            │  [Verify OTP Button]     │
                            └────────┬─────────────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │ Verify OTP with        │
                        │ Supabase               │
                        └────────┬───────────────┘
                                 │
                      ┌──────────┴──────────┐
                      │                     │
                      ▼ INVALID             ▼ VALID
            ┌─────────────────┐  ┌───────────────────────┐
            │ Error Message   │  │ Fetch role from       │
            │ "Incorrect OTP" │  │ profiles.role         │
            │ Try again       │  └───────────┬───────────┘
            └─────────────────┘              │
                                 ┌──────────┼──────────┐
                                 │          │          │
                                 ▼          ▼          ▼
                            admin      doctor    patient
                             │          │          │
                             ▼          ▼          ▼
                        /admin-    /doctor/    /patient/
                        dashboard  dashboard   home
```

---

## Database Schema (Simple View)

```
┌─────────────────────────────────────────────────────────┐
│              auth.users (Supabase Auth)                 │
│                                                          │
│  id (UUID)                                              │
│  email                                                  │
│  phone (← Used for OTP login)                           │
│  created_at                                             │
└──────────────────────────┬───────────────────────────────┘
                           │ Links via user.id
                           ▼
┌──────────────────────────────────────────────────────────┐
│           public.profiles (Your Data)                   │
│                                                          │
│  id (← Foreign key to auth.users)                       │
│  email                                                  │
│  phone_number ★ UNIQUE ★ (← Primary login)             │
│  role (admin/doctor/patient) ← ROLE LOADED HERE        │
│  full_name                                              │
│  otp_code (← Temporary, cleared after verify)          │
│  otp_expires_at (← Expires in 5 min)                   │
│  otp_attempts (← Max 5 before lockout)                 │
│  created_at                                             │
│  updated_at                                             │
└──────────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────┐
│                    ROUTE PROTECTION                        │
│                   (ProtectedRoute.tsx)                     │
└────────────────────────────────────────────────────────────┘

                            USER REQUESTS ROUTE
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │ Check: Is authenticated?   │
                    └────┬───────────────────┬───┘
                         │ NO               │ YES
                         ▼                  ▼
                    Redirect to      ┌──────────────────┐
                    /login           │ Check: Required  │
                                     │ role matches?    │
                                     └───┬──────────┬───┘
                                         │ YES      │ NO
                                         ▼          ▼
                                    ALLOW      REDIRECT TO
                                    ACCESS     USER'S DASHBOARD
                                    ROUTE
                    
EXAMPLES:

┌──────────────────────────────────────────────────────────┐
│ <ProtectedRoute requiredRole="doctor">                  │
│   <DoctorDashboard />                                   │
│ </ProtectedRoute>                                       │
│                                                          │
│ Access Rules:                                            │
│ • Patient tries → Redirected to /patient/home           │
│ • Admin tries → Redirected to /admin-dashboard          │
│ • Doctor tries → ALLOWED                                │
│ • No auth → Redirected to /login                        │
└──────────────────────────────────────────────────────────┘
```

---

## File Relationship Chart

```
┌─────────────────────────────────────────────────────────┐
│ App.tsx (Main Router)                                   │
│                                                          │
│ ├─ / → RoleSelection                                    │
│ ├─ /login → Login                                       │
│ ├─ /signup → Signup                                     │
│ │                                                        │
│ ├─ /admin-dashboard (Protected)                         │
│ ├─ /doctor/* (Protected)                                │
│ └─ /patient/* (Protected)                               │
└────────────────────┬────────────────────────────────────┘
                     │ Uses
                     ▼
    ┌────────────────────────────────────┐
    │ ProtectedRoute.tsx                 │
    │ ├─ Checks authentication           │
    │ ├─ Checks role (RBAC)              │
    │ └─ Redirects if access denied      │
    └────────────────────────────────────┘
          ▲         ▲                ▲
          │         │                │ Uses
          │         │                │
    ┌─────┴─────────┴────────────────┴────────┐
    │                                          │
    │       AuthContext.tsx                   │
    │  ┌────────────────────────────────┐    │
    │  │ Functions:                     │    │
    │  │ • requestOTP()                 │    │
    │  │ • verifyOTP()                  │    │
    │  │ • signOut()                    │    │
    │  │                                 │    │
    │  │ State:                         │    │
    │  │ • user (Session)               │    │
    │  │ • role (From database)         │    │
    │  │ • phoneNumber                  │    │
    │  │ • loading                      │    │
    │  └────────────────────────────────┘    │
    │           ▲                            │
    │           │ Uses                       │
    │           ▼                            │
    │  ┌────────────────────────────────┐   │
    │  │ supabase/client.ts             │   │
    │  │ ├─ OTP requests                │   │
    │  │ ├─ Database queries            │   │
    │  │ └─ Authentication              │   │
    │  └────────────────────────────────┘   │
    │           ▲                            │
    │           │ Calls                      │
    │           ▼                            │
    │  ┌────────────────────────────────────────┐
    │  │ Supabase Remote                        │
    │  │ ├─ auth.users (Phone + OTP)           │
    │  │ ├─ profiles (Role + User Info)        │
    │  └────────────────────────────────────────┘
    └────────────────────────────────────────────────────┘
```

---

## Login Component State Machine

```
                     ┌──────────────┐
                     │   INITIAL    │
                     │ (step=phone) │
                     └──────┬───────┘
                            │
                ┌───────────┴───────────┐
                │  User enters phone    │
                │  & clicks "Send OTP"  │
                └───────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │ REQUESTING OTP │
                    │ (loading=true) │
                    └───────┬────────┘
                            │
                ┌───────────┴────────────┐
                │ Does phone exist?      │
                │ (Check in database)    │
                └───┬──────────────┬─────┘
                    │ NO           │ YES
                    ▼              ▼
            ┌──────────────┐   ┌─────────────┐
            │ Show Error:  │   │ OTP SENT    │
            │ "Not         │   │ (step=otp)  │
            │ registered"  │   └─────┬───────┘
            │              │        │
            │ (loading=false)        │ Start 30-sec
            └──────────────┘         │ countdown
                                    │
                            ┌───────▼───────┐
                            │ User enters   │
                            │ OTP & clicks  │
                            │ "Verify OTP"  │
                            └───────┬───────┘
                                    │
                            ┌───────▼────────┐
                            │ VERIFYING OTP  │
                            │ (loading=true) │
                            └───────┬────────┘
                                    │
                            ┌───────▴─────────┐
                            │                 │
                            ▼                 ▼
                        VALID            INVALID
                            │                 │
                            ▼                 ▼
                    ┌──────────────┐   ┌─────────────┐
                    │ Fetch role   │   │ Show Error  │
                    │ from DB      │   │ "Incorrect" │
                    └──────┬───────┘   └─────────────┘
                           │ (stay on step=otp)
                           ▼
                    ┌──────────────────┐
                    │ Auto-Redirect:   │
                    │ • admin → /adm.. │
                    │ • doctor →/doc.. │
                    │ • patient →/pat..│
                    └──────────────────┘
```

---

## Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY STACK                            │
└──────────────────────────────────────────────────────────────┘

Layer 1: AUTHENTICATION (Is user who they claim?)
├─ Phone verification (registration check)
├─ OTP verification (SMS code check)
├─ OTP expiry (5 minutes max)
└─ Brute force protection (5 attempts max)

Layer 2: AUTHORIZATION (Is user allowed to do this?)
├─ Role-based access control (RBAC)
├─ Protected routes (ProtectedRoute component)
├─ Server-side role validation
└─ Wrong role → redirect to correct dashboard

Layer 3: DATA SECURITY
├─ Phone field UNIQUE (no duplicates)
├─ OTP cleared after verification
├─ Attempt counter reset on success
├─ Passwords removed (OTP only)
└─ No session tokens in localStorage

Layer 4: API SECURITY
├─ All queries to profiles table
├─ Row-level security (RLS) policies
├─ Database validation
└─ Supabase Auth handling session
```

---

## User Journey Map

```
PATIENT JOURNEY
───────────────
Day 1: Registration (Admin)
  → Admin adds phone + role to database
  → User receives notification

Day 1: First Login
  → Open app → See "Enter phone"
  → Enter 310-555-1234
  → Get SMS with OTP
  → Enter OTP 123456
  → ✅ Logged in → See exercises

Daily: Exercise
  → Complete exercise with timer
  → Submit for completion
  → See pain log

DOCTOR JOURNEY
──────────────
Day 1: Registration (Clinic Admin)
  → Admin adds doctor phone + role
  → Doctor receives notification

Day 1: First Login
  → Open app → See "Enter phone"
  → Enter 310-999-5555
  → Get SMS with OTP
  → Enter OTP 123456
  → ✅ Logged in → See patient list

Daily: Patient Management
  → Add new patient
  → Assign exercises
  → Review patient progress
  → Modify plan as needed

ADMIN JOURNEY
─────────────
Rarely logs in, but when they do:
  → Enter phone → OTP
  → See admin dashboard
  → Manage users (SQL-based)
```

---

## Change Impact Matrix

```
┌─────────────────────────────────────────────────────────┐
│                    WHO AFFECTED?                        │
├──────────────────┬──────────────┬──────────────────────┤
│ USERS            │ IMPACT       │ DETAILS              │
├──────────────────┼──────────────┼──────────────────────┤
│ Existing Users   │ MUST UPDATE  │ Need to register     │
│                  │ PROFILE      │ with phone number    │
├──────────────────┼──────────────┼──────────────────────┤
│ New Users        │ NO CHANGE    │ Clinic registers     │
│                  │              │ them directly        │
├──────────────────┼──────────────┼──────────────────────┤
│ Clinic Admin     │ MEDIUM       │ Use SQL to add users │
│                  │              │ (templates provided) │
├──────────────────┼──────────────┼──────────────────────┤
│ Developers       │ HIGH         │ New auth context +   │
│                  │              │ component updates    │
├──────────────────┼──────────────┼──────────────────────┤
│ DevOps           │ LOW          │ Just run migration   │
├──────────────────┼──────────────┼──────────────────────┤
│ QA               │ MEDIUM       │ Test all 3 roles +   │
│                  │              │ edge cases           │
└──────────────────┴──────────────┴──────────────────────┘
```

---

## Deployment Timeline

```
Day -1: PREPARATION
├─ Review documentation
├─ Set up staging database
└─ Test in staging environment

Day 0: TESTING
├─ Test OTP flow (all 3 roles)
├─ Test unregistered user error
├─ Test security (brute force, OTP expiry)
├─ Load testing
└─ Sign-off from team

Day 1: DEPLOYMENT
├─ Morning: Deploy to production
├─ Immediate: Smoke test
├─ Hour 1-2: Monitor errors + logs
├─ Hour 2-4: Gradual user migration
└─ Day 1 evening: Full rollout

Day 2+: MONITORING
├─ OTP success rate
├─ Error patterns
├─ User feedback
└─ Performance metrics
```

---

**Visual Guide Complete** ✅

For detailed explanations, see the full documentation files.
