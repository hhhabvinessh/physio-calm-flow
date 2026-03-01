# 🏗️ PROFESSIONAL MEDICAL REMINDER SYSTEM - ARCHITECTURE & CODE REFERENCE

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHYSIOTHERAPY CLINIC APP                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND (React Components)            BACKEND (Services & Database)    │
│  ──────────────────────────────         ──────────────────────────────  │
│                                                                           │
│  ┌──────────────────────────┐          ┌──────────────────────────────┐ │
│  │ MedicalNotificationSetup │          │ reminderScheduler.ts         │ │
│  │ - Permission Request     │──────┐   │ - Runs every 60 seconds      │ │
│  │ - Starts Scheduler       │──┐   │   │ - Checks for due reminders   │ │
│  └──────────────────────────┘  │   │   │ - Sends notifications        │ │
│                                 │   │   └──────────────────────────────┘ │
│  ┌──────────────────────────┐  │   │            ↓                        │
│  │ExerciseReminder         │  │   │   ┌──────────────────────────────┐ │
│  │Settings (Doctor UI)      │  │   │   │ remnderAPI.ts              │ │
│  │ - Toggle on/off         │  │   └───│ - getPatientsDueForReminder()│ │
│  │ - Add/remove times      │──┼──────│ - logReminderSent()         │ │
│  │ - Show settings         │  │       │ - updatePatientReminder... │ │
│  └──────────────────────────┘  │       └──────────────────────────────┘ │
│                                 │            ↓                           │
│  ┌──────────────────────────┐  │       ┌──────────────────────────────┐ │
│  │ useMedicalReminders Hook │  │       │ SUPABASE DATABASE            │ │
│  │ - State Management       │  │       │                              │ │
│  │ - Permission Check       │  │       │ ┌────────────────────────┐  │ │
│  └──────────────────────────┘  │       │ │ patients table         │  │ │
│                                 │       │ │ - reminder_enabled     │  │ │
│  Patient receives notification  │       │ │ - reminder_times[]     │  │ │
│  ↓                              │       │ │ - last_reminder_sent_at│  │ │
│  ┌──────────────────────────┐  │       │ └────────────────────────┘  │ │
│  │ Browser Notification API │  │       │                              │ │
│  │ - Shows to patient      │  │       │ ┌────────────────────────┐  │ │
│  │ - Professional tone     │  │       │ │ reminder_logs table    │  │ │
│  │ - No emojis             │  │       │ │ - Track all sends      │  │ │
│  │ - HIPAA compliant       │  │       │ │ - For audit            │  │ │
│  └──────────────────────────┘  │       │ └────────────────────────┘  │ │
│                                 │       │                              │ │
│  Doctor confirms                │       │ ┌────────────────────────┐  │ │
│  clinic received notification   │       │ │ reminder_settings_audit│  │ │
│                                 │       │ │ - Track changes        │  │ │
│                                 │       │ │ - Compliance trail     │  │ │
│                                 │       │ └────────────────────────┘  │ │
│                                 │       └──────────────────────────────┘ │
│                                 └──────────────────────────────┤          │
│                                                              RLS         │
│                                                           Policies      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Patient Login & Scheduler Initialization

```
Patient Logs In
    ↓
MedicalNotificationSetup renders
    ↓
useMedicalReminders Hook activates
    ↓
Check: isNotificationSupported()
    ├─ YES → Continue
    └─ NO  → Exit silently
    ↓
Check: Notification Permission
    ├─ GRANTED → Skip permission request
    ├─ DENIED  → Show permission request banner
    └─ DEFAULT → Show permission request banner
    ↓
[Optional] User clicks "Enable Reminders"
    ↓
Browser shows permission dialog
    ↓
User grants permission
    ↓
initializeScheduler() called
    ├─ setInterval(..., 60 * 1000)
    ├─ Runs immediately
    └─ Runs every 60 seconds
    ↓
Scheduler starts checking for reminders
```

### 2. Reminder Check & Send Process

```
Every 60 Seconds:

┌─────────────────────────────────────────────────────────┐
│ checkAndSendReminders() executes                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Call getPatientsDueForReminder()                    │
│    └─ Query database for patients where:               │
│       - reminder_enabled = true                        │
│       - current_time matches reminder_times            │
│       - last_reminder_sent_at < 1 minute ago           │
│                                                         │
│ 2. No matches?                                          │
│    └─ Return (nothing to do)                           │
│                                                         │
│ 3. Matches found:                                       │
│    ├─ For each patient:                                │
│    │  ├─ sendExerciseReminder()                        │
│    │  │  ├─ Send professional notification             │
│    │  │  ├─ Title: "Time for Your Physio Exercises"   │
│    │  │  └─ Body: "Please complete your exercises"    │
│    │  │                                                │
│    │  └─ logReminderSent(patientId)                   │
│    │     ├─ Update patients.last_reminder_sent_at     │
│    │     ├─ Insert into reminder_logs                 │
│    │     └─ Database lock prevents duplicates         │
│    │                                                   │
│    └─ Continue with next patient                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
        ↓ (Repeat every 60 seconds)
```

### 3. Doctor Modifies Reminder Settings

```
Doctor Views Patient Details Page
        ↓
ExerciseReminderSettings component mounts
        ↓
getPatientReminderSettings(patientId) called
        ├─ Query: SELECT reminder_enabled, reminder_times FROM patients
        └─ Check doctor can access this patient (via RLS)
        ↓
Component displays current settings
        ├─ Toggle switch (current state)
        ├─ List of reminder times
        └─ Add time input
        ↓
Doctor interacts (toggle/add/remove)
        ↓
updatePatientReminderSettings() called
        ├─ Validate input times
        ├─ Check doctor authorization
        ├─ Update patients table
        ├─ Create audit log entry
        │  └─ WHO: doctor_id
        │  └─ WHAT: old_times → new_times
        │  └─ WHEN: timestamp
        │  └─ WHY: change reason
        └─ Return success/error
        ↓
UI updates with toast notification
        ├─ Success: "Settings saved"
        └─ Error: "Failed to save"
```

---

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│                                                             │
│  <Routes/>                                                  │
│  ├─ Login                                                   │
│  ├─ Doctor Dashboard                                        │
│  │  └─ [NEW] ExerciseReminderSettings instance             │
│  └─ Patient Home                                            │
│                                                             │
│  <MedicalNotificationSetup /> ←─ NEW COMPONENT             │
│  └─ Requests permission + starts scheduler                 │
└─────────────────────────────────────────────────────────────┘
         │
         └─→ useMedicalReminders() Hook
             ├─ Manages notification state
             ├─ Handles permission requests
             └─ Initializes scheduler lifecycle
                  │
                  └─→ reminderScheduler.ts
                      ├─ startReminderScheduler()
                      ├─ checkAndSendReminders()
                      └─ Runs every 60 seconds
                           │
                           └─→ reminderAPI.ts
                               ├─ getPatientsDueForReminders()
                               ├─ logReminderSent()
                               └─ Queries/updates database
                                    │
                                    └─→ medicalReminder.ts
                                        ├─ sendExerciseReminder()
                                        ├─ Professional content
                                        └─ Browser Notification API
```

---

## Security & Access Control

### RLS Policies Diagram

```
┌────────────────────────────────────────────────────────────┐
│          Row-Level Security (RLS) Policies                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  patients TABLE                                            │
│  ├─ Doctor can SELECT * where doctor_id = current_user   │
│  ├─ Doctor can UPDATE reminders for own patients         │
│  └─ Patient can SELECT their own record                   │
│                                                            │
│  reminder_logs TABLE                                       │
│  ├─ Doctor can read logs of their patients' reminders    │
│  ├─ Patient can read their own logs                      │
│  └─ Only system can INSERT                               │
│                                                            │
│  reminder_settings_audit TABLE                            │
│  ├─ Doctor can read audit trail of their patients       │
│  ├─ Admin can read all audit trails                      │
│  └─ Only system can INSERT                               │
│                                                            │
└────────────────────────────────────────────────────────────┘

ACCESS MATRIX:

╔════════════════╦═════════════╦═════════╦═════════╗
║ Action         ║ Doctor      ║ Admin   ║ Patient ║
╠════════════════╬═════════════╬═════════╬═════════╣
║ View own       ║ ✓           ║ ✓       ║ ✓       ║
║ reminders      ║ (own pts)   ║ (all)   ║ (self)  ║
╠════════════════╬═════════════╬═════════╬═════════╣
║ Edit own       ║ ✓           ║ ✓       ║ ✗       ║
║ reminders      ║ (own pts)   ║ (all)   ║         ║
╠════════════════╬═════════════╬═════════╬═════════╣
║ View audit     ║ ✓           ║ ✓       ║ ✗       ║
║ trail          ║ (own pts)   ║ (all)   ║         ║
╠════════════════╬═════════════╬═════════╬═════════╣
║ View reminder  ║ ✓           ║ ✓       ║ ✓       ║
║ logs           ║ (own pts)   ║ (all)   ║ (self)  ║
╚════════════════╩═════════════╩═════════╩═════════╝
```

---

## Database Schema

### New Columns on patients Table

```sql
reminder_enabled BOOLEAN 
  DEFAULT true
  NOT NULL
  ├─ Controls if reminders are active
  └─ Doctor can toggle on/off

reminder_times TEXT[] 
  DEFAULT ARRAY['08:00', '18:00']
  NOT NULL
  ├─ Array of HH:MM times
  ├─ Max 3 times per day
  └─ Validated by trigger

last_reminder_sent_at TIMESTAMPTZ 
  ├─ Timestamp of last sent reminder
  ├─ NULL if never sent
  └─ Used for duplicate prevention (1-min rule)

last_reminder_type TEXT 
  ├─ Type: 'exercise', 'pain_log', etc
  └─ For tracking what type of reminder
```

### New Tables

```sql
reminder_logs
├─ id (UUID, PK)
├─ patient_id (UUID, FK → patients)
├─ reminder_time (TEXT, HH:MM format)
├─ reminder_type (TEXT, 'exercise', etc)
├─ sent_at (TIMESTAMPTZ, auto-set)
├─ delivered (BOOLEAN, default true)
├─ delivery_method (TEXT, 'browser', 'sms', etc)
└─ notes (TEXT, optional)

reminder_settings_audit
├─ id (UUID, PK)
├─ patient_id (UUID, FK → patients)
├─ modified_by (UUID, FK → auth.users)
├─ old_reminder_enabled (BOOLEAN)
├─ new_reminder_enabled (BOOLEAN)
├─ old_reminder_times (TEXT[])
├─ new_reminder_times (TEXT[])
├─ change_reason (TEXT)
└─ created_at (TIMESTAMPTZ)
```

### Indexes for Performance

```sql
-- Fast lookup for active reminders
CREATE INDEX idx_patients_reminder_enabled 
ON patients(reminder_enabled);

-- Fast retrieval of recent reminder logs
CREATE INDEX idx_reminder_logs_patient_created 
ON reminder_logs(patient_id, created_at);

-- Fast audit trail queries
CREATE INDEX idx_reminder_settings_audit_patient 
ON reminder_settings_audit(patient_id, created_at);
```

---

## API Reference

### reminderAPI.ts Endpoints

#### getPatientReminderSettings

```typescript
const { data, error } = await getPatientReminderSettings(patientId: string)

Returns:
{
  reminder_enabled: boolean,
  reminder_times: string[]
}

Errors:
- Patient not found
- Insufficient permissions
```

#### updatePatientReminderSettings

```typescript
const { success, error } = await updatePatientReminderSettings(
  patientId: string,
  settings: ReminderSettings,
  reason?: string
)

Validates:
- User is doctor of patient OR admin
- Reminder times format (HH:MM)
- Max 3 times
- No duplicates

Creates:
- Audit log entry
- Update to patients table
```

#### getPatientsDueForReminders

```typescript
const results = await getPatientsDueForReminders()

Returns array:
[{
  patient_id: UUID,
  user_id: UUID,
  doctor_id: UUID,
  reminder_time: "HH:MM"
}]

Query Notes:
- Runs via RPC for security
- Prevents duplicate sends
- Returns only patients ready NOW
```

#### logReminderSent

```typescript
const { success, error } = await logReminderSent(
  patientId: string,
  reminderTime: string,
  reminderType: string
)

Creates:
- Entry in reminder_logs
- Updates patient.last_reminder_sent_at
- Updates patient.last_reminder_type
```

---

## Validation Rules Engine

```typescript
// File: src/lib/reminderValidation.ts

validateReminderTimes(times: string[]): {valid: boolean, error?: string}

Rules:
1. Array not empty
   ✗ [] → "At least one reminder time required"

2. Maximum 3 times
   ✗ ["08:00", "12:00", "14:00", "18:00"] → "Max 3 times allowed"

3. No duplicates
   ✗ ["08:00", "08:00"] → "Duplicate times not allowed"

4. Valid HH:MM format
   ✗ ["8:00", "18:00"] → "Invalid format (use HH:MM)"
   ✓ ["08:00", "18:00"] → OK

5. Valid hours (0-23)
   ✗ ["25:00"] → "Invalid hour"

6. Valid minutes (0-59)
   ✗ ["18:60"] → "Invalid minute"

Valid Examples:
✓ ["08:00", "18:00"]
✓ ["07:00", "13:00", "19:00"]
✓ ["00:00"] (midnight)
✓ ["23:59"] (11:59 PM)
```

---

## Scheduler Loop Explained

```
EVERY 60 SECONDS:

1. Check time: Current time in database?
   if 08:00:00 → 08:00:59: Check for reminders
   else if 08:01:00 → 08:01:59: Check for reminders
   ...
   else: No check needed

2. Query database in current minute:
   SELECT * FROM patients
   WHERE reminder_enabled = true
   AND "08:00"::text = ANY(reminder_times)  -- Hour:Minute match
   AND last_reminder_sent_at < now() - '1 minute'::interval

   Result: Only patients due RIGHT NOW
   - Those who haven't had reminder in last minute

3. For each patient found:
   ├─ sendExerciseReminder()
   │  └─ Browser notification with standard content
   └─ logReminderSent()
      ├─ Update last_reminder_sent_at to NOW()
      └─ Insert into reminder_logs

4. Next cycle (60 seconds later):
   Database lock prevents duplicate sends
   Because last_reminder_sent_at was just updated
```

---

## Professional Notification Content

```typescript
// All notifications follow medical standards

NOTIFICATION_CONTENT = {
  exercise: {
    title: "Time for Your Physiotherapy Exercises",
    body: "Please complete your assigned rehabilitation exercises.",
    // Single tag prevents duplicates
    tag: "exercise-reminder"
  },
  
  pain_log: {
    title: "Pain Assessment Time",
    body: "Please update your pain level in the app.",
    tag: "pain-log-reminder"
  },
  
  new_assignment: {
    title: "New Exercise Assigned",
    body: "Your doctor has assigned new rehabilitation exercises.",
    tag: "new-assignment"
  }
  
  // NO EMOJIS
  // NO EXCLAMATION MARKS
  // NO AGGRESSIVE LANGUAGE
  // Professional, calm tone throughout
}
```

---

## Component Props & Types

### ExerciseReminderSettings Props

```typescript
interface ExerciseReminderSettingsProps {
  patientId: string;  // UUID of patient
}

Features:
- Auto-loads current settings
- Toggle reminders on/off
- Add reminder times (1-3, HH:MM format)
- Remove reminder times
- Real-time validation
- Toast notifications
- Audit trail creation
```

### useMedicalReminders Return

```typescript
interface UseMedicalRemindersReturn {
  isSupported: boolean;           // Browser supports?
  isPermitted: boolean;           // Permission granted?
  isLoading: boolean;             // Init in progress?
  schedulerRunning: boolean;      // Scheduler active?
  
  requestPermission(): Promise<boolean>;
  startScheduler(): void;
  stopScheduler(): void;
}
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────┐
│ Error at each layer               │
├─────────────────────────────────────┤
│                                   │
│ Database Layer:                   │
│ ├─ Validation constraint error    │
│ ├─ RLS policy denial              │
│ └─ Connection timeout             │
│    ↓                              │
│ [Log to console]                  │
│    ↓                              │
│                                   │
│ API Layer (reminderAPI.ts):       │
│ ├─ Catch DB errors               │
│ ├─ Return {success, error}       │
│ └─ Don't crash app               │
│    ↓                              │
│ [Log + return to caller]          │
│    ↓                              │
│                                   │
│ Component Layer:                  │
│ ├─ Display toast error            │
│ ├─ Show user-friendly message    │
│ └─ Retry option                   │
│    ↓                              │
│ [User can retry/dismiss]          │
│                                   │
│ Scheduler Layer:                  │
│ ├─ Try/catch wraps checks        │
│ ├─ Logs to console               │
│ └─ Continues to next patient     │
│    ↓                              │
│ [One error doesn't break loop]    │
│                                   │
└─────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

```typescript
// reminderValidation.ts
test("validateReminderTimes rejects duplicates");
test("validateReminderTimes rejects >3 times");
test("validateReminderTimes accepts valid times");

// medicalReminder.ts
test("notification content doesn't contain emojis");
test("notification titles are professional");
```

### Integration Tests

```typescript
// Full flow
test("Doctor updates patient settings → saved to DB → audit trail created");
test("Scheduler checks at correct times → sends notifications");
test("RLS prevents doctor from accessing other doctor's patients");
```

### E2E Tests

```
1. Patient Logs In
   → Permission banner shown
   → User clicks enable
   → Notification sent successfully

2. Doctor Views Patient
   → Settings loaded
   → Toggles reminders
   → Change saved
   → Toast confirms

3. Reminder Time Matches
   → Scheduler detects
   → Notification sent
   → Log created
   → Duplicate prevented next minute
```

---

**Version:** 1.0  
**Last Updated:** 2025-02-25  
**Status:** Production Ready
