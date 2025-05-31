"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Play, Timer, Coffee } from "lucide-react"
import { useSession } from "@/context/session-context"

export default function StartSessionForm() {
  const [workDuration, setWorkDuration] = useState<number>(25)
  const [breakDuration, setBreakDuration] = useState<number>(5)
  const [title, setTitle] = useState<string>("")
  const { startSession, isStarting } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workDuration || !breakDuration) {
      return
    }

    await startSession(workDuration, breakDuration, title || undefined)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Start Focus Session</CardTitle>
          <CardDescription>Configure your Pomodoro timer and begin a focused work session</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Focus Time */}
            <div className="space-y-2">
              <Label htmlFor="workDuration" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Focus Time (minutes) *
              </Label>
              <Input
                id="workDuration"
                type="number"
                min="1"
                max="120"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                placeholder="25"
                required
                disabled={isStarting}
              />
              <p className="text-sm text-muted-foreground">Recommended: 25 minutes for optimal focus</p>
            </div>

            {/* Break Time */}
            <div className="space-y-2">
              <Label htmlFor="breakDuration" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Break Time (minutes) *
              </Label>
              <Input
                id="breakDuration"
                type="number"
                min="1"
                max="30"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                placeholder="5"
                required
                disabled={isStarting}
              />
              <p className="text-sm text-muted-foreground">Recommended: 5 minutes for short breaks</p>
            </div>

            {/* Focus Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Focus Title (optional)</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you working on?"
                maxLength={100}
                disabled={isStarting}
              />
              <p className="text-sm text-muted-foreground">Give your session a name to track what you're working on</p>
            </div>

            {/* Start Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isStarting || !workDuration || !breakDuration}>
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Focus Session
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
