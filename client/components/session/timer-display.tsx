"use client"

import { useSession } from "@/context/session-context"
import { Loader2 } from "lucide-react"

export default function TimerDisplay() {
  const { timeRemaining, isTimeOver, isTimerInitialized } = useSession()

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Show loader while timer is initializing
  if (!isTimerInitialized) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Initializing timer...</p>
      </div>
    )
  }

  if (isTimeOver) {
    return (
      <div className="text-center">
        <div className="text-6xl font-mono font-bold text-red-500">TIME OVER</div>
        <p className="text-muted-foreground mt-2">Your focus session has ended!</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold text-primary">{formatTime(timeRemaining)}</div>
      <p className="text-muted-foreground mt-2">Focus time remaining</p>
    </div>
  )
}
