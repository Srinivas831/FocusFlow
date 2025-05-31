"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Check, X } from "lucide-react"
import {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  areNotificationsEnabledForUser,
  enableNotificationsForUser,
  disableNotificationsForUser,
  sendTestNotification,
} from "@/lib/notification-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export default function NotificationPermissionRequest() {
  const [showRequest, setShowRequest] = useState<boolean>(false)
  const [isRequesting, setIsRequesting] = useState<boolean>(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return // Don't show if no user is logged in

    // Check if current user has already set up notifications
    const userNotificationsEnabled = areNotificationsEnabledForUser(user._id)
    const hasSetupKey = `notificationSetupComplete_${user._id}`
    const hasCompletedSetup = localStorage.getItem(hasSetupKey)

    // Show setup if user hasn't completed notification setup yet
    if (isNotificationSupported() && !hasCompletedSetup) {
      setShowRequest(true)
    }
  }, [user])

  const handleEnableNotifications = async () => {
    if (!user) return

    setIsRequesting(true)

    try {
      // First, request browser permission if not already granted
      const browserPermission = getNotificationPermission()

      if (browserPermission !== "granted") {
        const granted = await requestNotificationPermission()
        if (!granted) {
          toast({
            title: "Permission denied",
            description: "Please enable notifications in your browser settings to receive alerts.",
            variant: "destructive",
          })
          setIsRequesting(false)
          return
        }
      }

      // Enable notifications for this user
      enableNotificationsForUser(user._id)

      // Mark setup as complete
      localStorage.setItem(`notificationSetupComplete_${user._id}`, "true")

      // Send test notification
      setTimeout(() => {
        sendTestNotification(user._id)
      }, 500)

      setShowRequest(false)

      toast({
        title: "Notifications enabled!",
        description: "You'll receive alerts about your focus sessions. Check for the test notification!",
      })
    } catch (error) {
      console.error("Error enabling notifications:", error)
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRequesting(false)
    }
  }

  const handleSkip = () => {
    if (!user) return

    // Disable notifications for this user
    disableNotificationsForUser(user._id)

    // Mark setup as complete
    localStorage.setItem(`notificationSetupComplete_${user._id}`, "true")

    setShowRequest(false)

    toast({
      title: "Notifications disabled",
      description: "You can enable them later in your account settings.",
    })
  }

  if (!showRequest || !user) return null

  return (
    <div className="flex items-center justify-between p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Set up notifications for {user.userName}</p>
          <p className="text-sm text-gray-600">
            Get alerts when your focus sessions start and end, even when using other tabs.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleSkip} disabled={isRequesting}>
          <X className="h-4 w-4 mr-1" />
          Skip
        </Button>
        <Button size="sm" onClick={handleEnableNotifications} disabled={isRequesting}>
          {isRequesting ? (
            "Setting up..."
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Enable
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
