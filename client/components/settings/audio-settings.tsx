"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Volume2, VolumeX, Play, Bell } from "lucide-react"
import { audioService } from "@/lib/audio-service"
import { sendTestNotification } from "@/lib/notification-service"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AudioSettings() {
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      // Load audio settings when component mounts
      audioService.loadVolumeSettings(user._id)
      setVolume(Math.round(audioService.getVolume() * 100))
      setIsMuted(audioService.isMutedState())

      // Load notification settings
      const notifEnabled = localStorage.getItem(`notificationsEnabled_${user._id}`) === "true"
      setNotificationsEnabled(notifEnabled)
    }
  }, [user])

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    audioService.setVolume(vol / 100)
  }

  const handleMuteToggle = () => {
    const newMuted = audioService.toggleMute()
    setIsMuted(newMuted)
  }

  const handleNotificationToggle = (enabled: boolean) => {
    if (!user) return

    setNotificationsEnabled(enabled)
    if (enabled) {
      localStorage.setItem(`notificationsEnabled_${user._id}`, "true")
    } else {
      localStorage.setItem(`notificationsEnabled_${user._id}`, "false")
    }

    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled
        ? "You'll receive alerts about your focus sessions"
        : "You won't receive session notifications",
    })
  }

  const testAudio = () => {
    audioService.testAudio()
    toast({
      title: "Audio test",
      description: "Did you hear the test sound?",
    })
  }

  const testNotification = () => {
    if (user) {
      sendTestNotification(user._id)
      toast({
        title: "Notification test",
        description: "Check for the test notification!",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Settings
          </CardTitle>
          <CardDescription>Control sound volume and audio notifications for your sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume">Master Volume</Label>
              <span className="text-sm text-muted-foreground">{volume}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" onClick={handleMuteToggle}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                id="volume"
                min={0}
                max={100}
                step={5}
                value={[volume]}
                onValueChange={handleVolumeChange}
                disabled={isMuted}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Controls the volume of all audio notifications and session sounds
            </p>
          </div>

          <Separator />

          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mute All Sounds</Label>
              <p className="text-sm text-muted-foreground">Disable all audio notifications and sounds</p>
            </div>
            <Switch checked={isMuted} onCheckedChange={setIsMuted} />
          </div>

          <Separator />

          {/* Test Audio */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Test Audio</Label>
              <p className="text-sm text-muted-foreground">Play a test sound to check your audio settings</p>
            </div>
            <Button variant="outline" onClick={testAudio} disabled={isMuted}>
              <Play className="h-4 w-4 mr-2" />
              Test Sound
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage browser notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications when sessions start, end, or are interrupted
              </p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
          </div>

          <Separator />

          {/* Test Notification */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Test Notification</Label>
              <p className="text-sm text-muted-foreground">Send a test notification to verify it's working</p>
            </div>
            <Button variant="outline" onClick={testNotification} disabled={!notificationsEnabled}>
              <Bell className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audio Notification Types</CardTitle>
          <CardDescription>Different sounds for different session events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Session Start</span>
              </div>
              <p className="text-sm text-muted-foreground">Two high-pitched beeps when a focus session begins</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Session End</span>
              </div>
              <p className="text-sm text-muted-foreground">Three medium-pitched beeps when a session completes</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Session Abort</span>
              </div>
              <p className="text-sm text-muted-foreground">One long low-pitched beep when a session is aborted</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium">Test Sound</span>
              </div>
              <p className="text-sm text-muted-foreground">Two beeps to test your audio configuration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
