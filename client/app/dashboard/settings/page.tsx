"use client"

import ProtectedLayout from "@/components/layout/protected-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AudioSettings from "@/components/settings/audio-settings"
import { Settings, Volume2, User } from "lucide-react"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your FocusFlow preferences and configurations</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="audio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio & Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Audio & Notifications Tab */}
          <TabsContent value="audio" className="space-y-4">
            <AudioSettings />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Account settings coming soon...</p>
            </div>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">General settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
