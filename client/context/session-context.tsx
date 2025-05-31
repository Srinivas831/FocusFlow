"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { sessionAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
// Import notification service at the top of the file
import {
  sendSessionStartNotification,
  sendSessionEndNotification,
  sendSessionAbortNotification,
  requestNotificationPermission,
} from "@/lib/notification-service"

type Session = {
  _id: string
  userId: string
  workDuration: number
  breakDuration: number
  status: string
  interruptions: number
  startTime: string
  title?: string
  __v: number
}

type BlocklistItem = {
  _id: string
  userId: string
  type: string
  value: string
  __v: number
}

type SessionContextType = {
  activeSession: Session | null
  isLoading: boolean
  isStarting: boolean
  isAborting: boolean
  timeRemaining: number
  isTimeOver: boolean
  isTimerInitialized: boolean
  startSession: (workDuration: number, breakDuration: number, title?: string) => Promise<void>
  checkActiveSession: () => Promise<void>
  stopSession: () => void
  abortSession: (reason: string) => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isAborting, setIsAborting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimeOver, setIsTimeOver] = useState(false)
  const [isTimerInitialized, setIsTimerInitialized] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const sessionEndedRef = useRef(false)
  const hasCheckedSession = useRef(false)

  // Auto end session when timer reaches zero
  const endSessionAutomatically = async (sessionId: string) => {
    if (sessionEndedRef.current) return // Prevent duplicate calls

    sessionEndedRef.current = true

    try {
      console.log("Auto-ending session:", sessionId)

      // Hit the end session API
      const response = await sessionAPI.endSession(sessionId)
      console.log("Session ended successfully:", response)

      // Send message to Chrome extension to unblock websites
      window.postMessage({ type: "END_SESSION" }, "*")
      console.log("Sent END_SESSION message to Chrome extension")

      // Clear session data
      setActiveSession(null)
      localStorage.removeItem("activeSession")
      setTimeRemaining(0)
      setIsTimeOver(true)
      setIsTimerInitialized(false)

      // Send end notification
      if (user) {
        sendSessionEndNotification(user._id)
      }

      toast({
        title: "Session Completed!",
        description: "Your focus session has ended successfully",
      })
    } catch (error: any) {
      console.error("Error ending session:", error)
      toast({
        title: "Error",
        description: "Failed to end session properly",
        variant: "destructive",
      })
    }
  }

  // Timer logic - simplified and working version
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (activeSession && activeSession.status === "running") {
      sessionEndedRef.current = false // Reset the flag for new sessions

      // Calculate initial time
      const startTime = new Date(activeSession.startTime).getTime()
      const totalDuration = activeSession.workDuration * 60 * 1000 // convert to milliseconds

      const updateTimer = () => {
        const currentTime = new Date().getTime()
        const elapsedTime = currentTime - startTime
        const remaining = Math.max(0, totalDuration - elapsedTime)
        const remainingSeconds = Math.ceil(remaining / 1000)

        console.log(`Timer: ${remainingSeconds} seconds remaining`)

        if (remainingSeconds <= 0) {
          setTimeRemaining(0)
          setIsTimeOver(true)
          setIsTimerInitialized(true)
          endSessionAutomatically(activeSession._id)
          return
        }

        setTimeRemaining(remainingSeconds)
        setIsTimeOver(false)
        setIsTimerInitialized(true)
      }

      // Update immediately
      updateTimer()

      // Set up interval to update every second
      interval = setInterval(updateTimer, 1000)
    } else {
      // No active session, reset timer state
      setIsTimerInitialized(false)
      setTimeRemaining(0)
      setIsTimeOver(false)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activeSession])

  const sendToExtension = async (session: Session) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")

      // Fetch blocklist
      const blocklist = await sessionAPI.getBlocklist()
      console.log("Fetched blocklist:", blocklist)

      // Prepare payload for Chrome extension
      const payload = {
        sessionId: session._id,
        token,
        duration: session.workDuration,
        blocklist,
      }

      // Send to Chrome extension
      window.postMessage({ type: "START_SESSION", payload }, "*")
      console.log("Sent START_SESSION to Chrome extension:", payload)
    } catch (error) {
      console.error("Error sending to extension:", error)
    }
  }

  // Use useCallback to prevent function recreation on every render
  const checkActiveSession = useCallback(async () => {
    // Only check for active session if user is authenticated
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping session check")
      return
    }

    // Prevent multiple simultaneous checks
    if (hasCheckedSession.current) {
      console.log("Session check already performed, skipping")
      return
    }

    hasCheckedSession.current = true
    setIsLoading(true)
    console.log("Checking for active session...")

    try {
      // First check localStorage
      const storedSession = localStorage.getItem("activeSession")
      if (storedSession) {
        const session = JSON.parse(storedSession)
        setActiveSession(session)
        console.log("Found active session in localStorage:", session)
        // Don't set loading to false immediately, let timer initialization complete
        return
      }

      // If not in localStorage, check with API
      console.log("No session in localStorage, checking with API...")
      const response = await sessionAPI.getActiveSession()

      if (response.session && response.session !== "null") {
        setActiveSession(response.session)
        // Store in localStorage for future checks
        localStorage.setItem("activeSession", JSON.stringify(response.session))
        console.log("Found active session from API:", response.session)
        // Don't set loading to false immediately, let timer initialization complete
      } else {
        setActiveSession(null)
        console.log("No active session found")
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error checking active session:", error)
      setActiveSession(null)
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Set loading to false once timer is initialized or no session
  useEffect(() => {
    if (activeSession && isTimerInitialized) {
      setIsLoading(false)
    } else if (!activeSession) {
      setIsLoading(false)
    }
  }, [activeSession, isTimerInitialized])

  const startSession = async (workDuration: number, breakDuration: number, title?: string) => {
    setIsStarting(true)
    setIsTimerInitialized(false) // Reset timer initialization

    try {
      const sessionData: { workDuration: number; breakDuration: number; title?: string } = {
        workDuration,
        breakDuration,
      }

      if (title) {
        sessionData.title = title
      }

      console.log("Starting session with data:", sessionData)

      // Start session API call
      const response = await sessionAPI.startSession(sessionData)

      if (response.session) {
        // Store session locally immediately
        setActiveSession(response.session)
        localStorage.setItem("activeSession", JSON.stringify(response.session))
        console.log("Session started successfully:", response.session)

        // Send to Chrome extension (includes blocklist fetch)
        await sendToExtension(response.session)

        // Request notification permission and send start notification
        await requestNotificationPermission()
        if (user) {
          sendSessionStartNotification(response.session.workDuration, response.session.title, user._id)
        }

        // Show success toast
        toast({
          title: "Success!",
          description: response.message || "Session started successfully",
        })
      }
    } catch (error: any) {
      console.error("Error starting session:", error)
      setIsTimerInitialized(false)
      toast({
        title: "Error",
        description: error.message || "Failed to start session",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  const stopSession = async () => {
    if (!activeSession) return

    try {
      console.log("Stopping session:", activeSession._id)

      // Hit the end session API
      const response = await sessionAPI.endSession(activeSession._id)
      console.log("Session stopped successfully:", response)

      // Send message to Chrome extension to unblock websites
      window.postMessage({ type: "END_SESSION" }, "*")
      console.log("Sent END_SESSION message to Chrome extension")

      // Clear session data
      setActiveSession(null)
      localStorage.removeItem("activeSession")
      setTimeRemaining(0)
      setIsTimeOver(false)
      setIsTimerInitialized(false)
      hasCheckedSession.current = false // Reset for future checks

      toast({
        title: "Session Stopped",
        description: "Your focus session has been stopped",
      })
    } catch (error: any) {
      console.error("Error stopping session:", error)
      toast({
        title: "Error",
        description: "Failed to stop session properly",
        variant: "destructive",
      })
    }
  }

  const abortSession = async (reason: string) => {
    if (!activeSession) return

    setIsAborting(true)

    try {
      console.log("Aborting session:", activeSession._id, "Reason:", reason)

      // Hit the abort session API
      const response = await sessionAPI.abortSession(activeSession._id, reason)
      console.log("Session aborted successfully:", response)

      // Send message to Chrome extension to unblock websites
      window.postMessage({ type: "END_SESSION" }, "*")
      console.log("Sent END_SESSION message to Chrome extension")

      // Clear session data
      setActiveSession(null)
      localStorage.removeItem("activeSession")
      setTimeRemaining(0)
      setIsTimeOver(false)
      setIsTimerInitialized(false)
      sessionEndedRef.current = false
      hasCheckedSession.current = false // Reset for future checks

      // Send abort notification
      if (user) {
        sendSessionAbortNotification(user._id)
      }

      toast({
        title: "Session Aborted",
        description: response.message || "Your focus session has been aborted",
        variant: "destructive",
      })
    } catch (error: any) {
      console.error("Error aborting session:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to abort session properly",
        variant: "destructive",
      })
    } finally {
      setIsAborting(false)
    }
  }

  // Reset session check flag when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasCheckedSession.current = false
      setIsTimerInitialized(false)
    }
  }, [isAuthenticated])

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        isLoading,
        isStarting,
        isAborting,
        timeRemaining,
        isTimeOver,
        isTimerInitialized,
        startSession,
        checkActiveSession,
        stopSession,
        abortSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
