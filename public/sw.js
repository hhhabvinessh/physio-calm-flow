/**
 * 🧵 SERVICE WORKER - Hidden Helper
 * This runs in the background and handles notifications even when app is closed
 * 
 * Think of it like a security guard that watches your app 24/7!
 */

// ✅ WHEN SERVICE WORKER ACTIVATES
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated");
  event.waitUntil(clients.claim()); // Take control of all pages
});

// ✅ WHEN A NOTIFICATION IS CLICKED
self.addEventListener("notificationclick", (event) => {
  console.log("🎯 Notification clicked:", event.notification.tag);

  const notification = event.notification;
  const urlToOpen = notification.data?.url || "/";
  const action = event.action;

  // Handle different actions
  if (action === "close") {
    notification.close();
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );

  notification.close();
});

// ✅ WHEN A NOTIFICATION IS CLOSED
self.addEventListener("notificationclose", (event) => {
  console.log("❌ Notification closed:", event.notification.tag);
});

// ✅ BACKGROUND SYNC (Advanced - for offline support)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(
      // This runs when user comes back online
      fetch("/api/notifications/sync")
        .then(() => console.log("✅ Notifications synced"))
        .catch(() => console.log("⚠️ Sync failed, will retry"))
    );
  }
});
