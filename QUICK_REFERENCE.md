# 🚀 QUICK REFERENCE - COPY & PASTE CODE SNIPPETS

## Import What You Need

```typescript
// For sending different notifications
import { 
  sendExerciseReminder,
  sendPainTrackingReminder,
  sendNewAssignment,
  sendSystemNotification,
  requestNotificationPermission
} from "@/services/pushNotification";

// For using the notification hook
import { usePushNotifications } from "@/hooks/usePushNotifications";

// For UI components
import { NotificationSettings } from "@/components/NotificationSettings";
```

---

## 1️⃣ Exercise Reminder

**When patient completes exercise:**
```typescript
const handleExerciseComplete = async () => {
  // Your exercise completion logic here...
  
  // Send notification
  await sendExerciseReminder("Great job! Do the next exercise");
};
```

**When it's time for exercise:**
```typescript
const scheduleExerciseReminder = async (exerciseName: string) => {
  await sendExerciseReminder(exerciseName);
};

// Usage
await scheduleExerciseReminder("Shoulder Mobility Stretch");
```

---

## 2️⃣ Pain Tracking Reminder

**Remind patient to log pain:**
```typescript
const remindPainTracking = async () => {
  await sendPainTrackingReminder();
};

// In useEffect for daily reminder
useEffect(() => {
  const dailyReminder = setInterval(() => {
    remindPainTracking();
  }, 24 * 60 * 60 * 1000); // Every 24 hours
  
  return () => clearInterval(dailyReminder);
}, []);
```

---

## 3️⃣ New Assignment from Doctor

**When doctor assigns exercise to patient:**
```typescript
const handleAssignExercise = async (patientId: string, doctorName: string) => {
  // Save assignment to database...
  
  // Notify the patient
  await sendNewAssignment(doctorName);
};

// Usage
await handleAssignExercise("patient-123", "Dr. Smith");
```

---

## 4️⃣ System Message

**For any other notification:**
```typescript
// Achievement
await sendSystemNotification("🏆 You've completed 10 exercises!");

// Milestone
await sendSystemNotification("📈 Your pain score improved by 20%");

// Alert
await sendSystemNotification("⚠️ Update available - Pull down to refresh");

// Reminder
await sendSystemNotification("📅 Your appointment is tomorrow at 2 PM");
```

---

## 5️⃣ Use the Hook (Advanced)

**Check if notifications are supported:**
```typescript
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const MyComponent = () => {
  const { isSupported, isPermitted, isLoading, requestPermission } = usePushNotifications();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isSupported) return <div>Not supported</div>;
  
  return (
    <div>
      <p>Permitted: {isPermitted ? "✅" : "❌"}</p>
      {!isPermitted && (
        <button onClick={requestPermission}>Enable</button>
      )}
    </div>
  );
};
```

---

## 6️⃣ Add Settings Component to Page

**Add notification settings to patient dashboard:**
```typescript
import { NotificationSettings } from "@/components/NotificationSettings";

export const PatientDashboard = () => {
  return (
    <div className="space-y-8">
      <h1>Patient Dashboard</h1>
      
      {/* Add this component */}
      <NotificationSettings />
      
      {/* Other dashboard content */}
    </div>
  );
};
```

---

## 7️⃣ Request Permission Manually

**Ask for permission in custom flow:**
```typescript
const handleEnableNotifications = async () => {
  const granted = await requestNotificationPermission();
  
  if (granted) {
    toast.success("Notifications enabled! 🎉");
  } else {
    toast.error("Notifications denied");
  }
};
```

---

## 8️⃣ In Doctor Dashboard

**Send notification when assigning:**
```typescript
import { sendNewAssignment } from "@/services/pushNotification";

const DoctorDashboard = () => {
  const handleAssign = async (patientId: string) => {
    // Your assignment logic
    
    // Get doctor name from context/props
    const doctorName = "Dr. Smith";
    
    // Notify patient
    await sendNewAssignment(doctorName);
  };
  
  return (
    <button onClick={() => handleAssign("patient-123")}>
      Assign Exercise
    </button>
  );
};
```

---

## 9️⃣ In Patient Dashboard

**Reminder workflow:**
```typescript
import { sendPainTrackingReminder } from "@/services/pushNotification";

export const PatientHome = () => {
  // Remind to log pain every morning at 9 AM
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour === 9) {
        sendPainTrackingReminder();
      }
    };
    
    const timer = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);
  
  return <div>Patient Home</div>;
};
```

---

## 🔟 Testing Flow

**Test all notifications:**
```typescript
const testAllNotifications = async () => {
  console.log("Testing notifications...");
  
  await sendExerciseReminder("Test Exercise");
  await sleep(2000);
  
  await sendPainTrackingReminder();
  await sleep(2000);
  
  await sendNewAssignment("Dr. Test");
  await sleep(2000);
  
  await sendSystemNotification("All tests complete!");
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

---

## 🛠️ Common Patterns

### Pattern 1: Conditional Notification

```typescript
if (exerciseScore > 80) {
  await sendSystemNotification("🌟 Excellent work!");
} else if (exerciseScore > 50) {
  await sendSystemNotification("Good effort! Keep going.");
} else {
  await sendSystemNotification("Try again tomorrow!");
}
```

### Pattern 2: Sequence of Notifications

```typescript
// First notification
await sendExerciseReminder("Exercise 1: Warm up");

// After delay
setTimeout(async () => {
  await sendExerciseReminder("Exercise 2: Main workout");
}, 60000); // 1 minute later
```

### Pattern 3: User Preference Based

```typescript
// Check if user enabled notifications first
if (userPreferences.notificationsEnabled) {
  await sendSystemNotification("Your message");
}
```

### Pattern 4: Error Handling

```typescript
try {
  await sendExerciseReminder("New exercise");
} catch (error) {
  console.error("Notification failed:", error);
  // Fallback to toast
   toast.info("New exercise assigned to you");
}
```

---

## 📋 Validation Examples

### Strong Password Check

```typescript
// User must use this when setting password
const password = "MyPassword123";

const isValid = 
  password.length >= 6 &&           // At least 6 chars
  /[A-Z]/.test(password) &&         // Has uppercase
  /[0-9]/.test(password);           // Has number

console.log(isValid); // true
```

### Email Format Check

```typescript
const email = "user@example.com";

const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
console.log(isValid); // true
```

---

## 🎯 Full Example: Complete User Flow

```typescript
import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { sendExerciseReminder, sendNewAssignment } from "@/services/pushNotification";
import { NotificationSettings } from "@/components/NotificationSettings";

export const PatientHome = () => {
  const { isPermitted } = usePushNotifications();
  const [exercises, setExercises] = useState([]);

  // When page loads
  useEffect(() => {
    // Notify user about new assignments
    if (isPermitted) {
      sendNewAssignment("Dr. Smith");
    }
  }, [isPermitted]);

  // Handle exercise completion
  const handleCompleteExercise = async (exerciseId: string) => {
    // Mark as complete in database
    
    // Send notification
    await sendExerciseReminder("Great work! Next exercise ready");
    
    // Refresh list
    loadExercises();
  };

  const loadExercises = () => {
    // Load from API...
  };

  return (
    <div className="space-y-6">
      <h1>Your Exercises</h1>
      
      {/* Show notification settings */}
      <NotificationSettings />
      
      {/* List exercises */}
      {exercises.map(ex => (
        <div key={ex.id}>
          <h3>{ex.name}</h3>
          <button onClick={() => handleCompleteExercise(ex.id)}>
            Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 💾 Save These Patterns!

Copy this file somewhere safe. Perfect reference when you need to:
- Send a notification
- Check if notifications work
- Add notifications to a new page
- Debug notification issues

---

**Happy Notifying! 🎉**

Questions? Check `NOTIFICATION_SETUP_GUIDE.md`
