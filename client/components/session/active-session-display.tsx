"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, Calendar, Target } from "lucide-react"
import { useSession } from "@/context/session-context"
import TimerDisplay from "./timer-display"
import SessionControls from "./session-controls"

export default function ActiveSessionDisplay() {
  const { activeSession, isTimerInitialized } = useSession()

  if (!activeSession) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Display */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Active Focus Session</CardTitle>
          <CardDescription>Stay focused and avoid distractions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <TimerDisplay />

          {/* Session Controls - Only show when timer is initialized */}
          {isTimerInitialized && <SessionControls />}
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center justify-center">
            <Badge variant="default" className="text-sm px-3 py-1">
              {activeSession.status.toUpperCase()}
            </Badge>
          </div>

          {/* Session Details Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Timer className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{activeSession.workDuration}m</div>
              <div className="text-sm text-muted-foreground">Focus Time</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{activeSession.breakDuration}m</div>
              <div className="text-sm text-muted-foreground">Break Time</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{activeSession.interruptions}</div>
              <div className="text-sm text-muted-foreground">Interruptions</div>
            </div>
          </div>

          {/* Session Title */}
          {activeSession.title && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Session Focus</h3>
              <p className="text-muted-foreground">{activeSession.title}</p>
            </div>
          )}

          {/* Session Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Session ID:</span>
              <span className="font-mono">{activeSession._id}</span>
            </div>
            <div className="flex justify-between">
              <span>Started:</span>
              <span>{formatDate(activeSession.startTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
