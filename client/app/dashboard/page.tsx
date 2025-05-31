"use client"

import { useEffect } from "react"
import ProtectedLayout from "@/components/layout/protected-layout"
import StartSessionForm from "@/components/session/start-session-form"
import ActiveSessionDisplay from "@/components/session/active-session-display"
import ExtensionInstallPopup from "@/components/dashboard/extension-install-popup"
import NotificationPermissionRequest from "@/components/notification-permission-request"
import { useSession } from "@/context/session-context"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const { activeSession, isLoading, checkActiveSession, isTimerInitialized } = useSession()
  const { isAuthenticated } = useAuth()

  // Check for active session only once when dashboard loads and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Dashboard loaded, checking for active session...")
      checkActiveSession()
    }
  }, [isAuthenticated])

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Extension Install Popup - Only shows once */}
        <ExtensionInstallPopup />

        {/* Notification Permission Request - Only shows once */}
        <NotificationPermissionRequest />

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Your productivity command center</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Checking for active sessions...</span>
          </div>
        )}

        {/* Session Management - Only show when not loading */}
        {!isLoading && <>{activeSession ? <ActiveSessionDisplay /> : <StartSessionForm />}</>}
      </div>
    </ProtectedLayout>
  )
}
