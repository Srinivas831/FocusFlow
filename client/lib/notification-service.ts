import { audioService } from "./audio-service"

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return "Notification" in window
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log("Browser does not support notifications")
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

// Check current notification permission
export const getNotificationPermission = (): string => {
  if (!isNotificationSupported()) return "unsupported"
  return Notification.permission
}

// Check if notifications are enabled for current user
export const areNotificationsEnabledForUser = (userId: string): boolean => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false
  }

  const userPreference = localStorage.getItem(`notificationsEnabled_${userId}`)
  return userPreference === "true"
}

// Enable notifications for current user
export const enableNotificationsForUser = (userId: string): void => {
  localStorage.setItem(`notificationsEnabled_${userId}`, "true")
}

// Disable notifications for current user
export const disableNotificationsForUser = (userId: string): void => {
  localStorage.setItem(`notificationsEnabled_${userId}`, "false")
}

// Send notification with audio (only if user has enabled them)
export const sendNotification = (
  title: string,
  options: NotificationOptions = {},
  userId?: string,
  audioType?: "start" | "end" | "abort" | "test",
): Notification | null => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    console.log("Notifications not supported or permission not granted")
    return null
  }

  // Check if current user has enabled notifications
  if (userId && !areNotificationsEnabledForUser(userId)) {
    console.log("Notifications disabled for current user")
    return null
  }

  try {
    // Set default icon if not provided
    const defaultOptions: NotificationOptions = {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      silent: true, // We'll handle audio ourselves
      ...options,
    }

    const notification = new Notification(title, defaultOptions)

    // Play audio notification
    if (audioType) {
      audioService.playNotificationSound(audioType)
    }

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  } catch (error) {
    console.error("Error sending notification:", error)
    return null
  }
}

// Session notification types with audio
export const sendSessionStartNotification = (
  duration: number,
  title?: string,
  userId?: string,
): Notification | null => {
  const sessionTitle = title ? `: ${title}` : ""
  return sendNotification(
    `Focus Session Started${sessionTitle}`,
    {
      body: `Your ${duration}-minute focus session has begun. Stay focused!`,
      tag: "session-start",
    },
    userId,
    "start",
  )
}

export const sendSessionEndNotification = (userId?: string): Notification | null => {
  return sendNotification(
    "Focus Time Complete!",
    {
      body: `Great job! Your focus time is over. It's break time now.`,
      tag: "session-end",
    },
    userId,
    "end",
  )
}

export const sendSessionAbortNotification = (userId?: string): Notification | null => {
  return sendNotification(
    "Session Aborted",
    {
      body: `Your focus session has been aborted. You can start a new one anytime.`,
      tag: "session-abort",
    },
    userId,
    "abort",
  )
}

export const sendBreakOverNotification = (userId?: string): Notification | null => {
  return sendNotification(
    "Break Time Over",
    {
      body: `Your break is complete. Ready to start another focus session?`,
      tag: "break-over",
    },
    userId,
    "end",
  )
}

// Test notification with audio
export const sendTestNotification = (userId?: string): Notification | null => {
  return sendNotification(
    "Test Notification",
    {
      body: "This is a test notification from FocusFlow. You're all set!",
      tag: "test",
    },
    userId,
    "test",
  )
}
