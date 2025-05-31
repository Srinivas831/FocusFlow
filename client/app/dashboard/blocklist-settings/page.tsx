"use client"

import { useEffect } from "react"
import ProtectedLayout from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Globe, Loader2, ShieldAlert, AlertTriangle } from "lucide-react"
import { useBlocklist } from "@/context/blocklist-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import WebsiteInput from "@/components/blocklist/website-input"

export default function BlocklistSettings() {
  const { blocklist, isLoading, isAdding, isRemoving, addToBlocklist, removeFromBlocklist, fetchBlocklist } =
    useBlocklist()

  // Refresh blocklist when page loads
  useEffect(() => {
    fetchBlocklist()
  }, [fetchBlocklist])

  const handleAddWebsites = async (websites: string[]) => {
    await addToBlocklist(websites)
  }

  const handleRemoveSite = async (id: string) => {
    await removeFromBlocklist(id)
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blocklist Settings</h2>
          <p className="text-muted-foreground">Manage websites and apps to block during focus sessions</p>
        </div>

        {/* Info Alert */}
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>How blocking works</AlertTitle>
          <AlertDescription>
            Websites added to your blocklist will be inaccessible during active focus sessions. Make sure to install the
            FocusFlow Chrome extension for website blocking to work.
          </AlertDescription>
        </Alert>

        {/* Add New Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Add Websites to Blocklist</CardTitle>
            <CardDescription>Enter website domains and press Enter to add multiple sites at once</CardDescription>
          </CardHeader>
          <CardContent>
            <WebsiteInput onAddWebsites={handleAddWebsites} isAdding={isAdding} />
          </CardContent>
        </Card>

        {/* Current Blocklist */}
        <Card>
          <CardHeader>
            <CardTitle>Current Blocklist</CardTitle>
            <CardDescription>
              {blocklist.length} {blocklist.length === 1 ? "website" : "websites"} will be blocked during focus sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading blocklist...</span>
              </div>
            ) : blocklist.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No blocked sites</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add websites to block during focus sessions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocklist.map((site) => (
                  <div key={site._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{site.value}</span>
                      <Badge variant="secondary">Blocked</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSite(site._id)}
                      disabled={isRemoving === site._id}
                    >
                      {isRemoving === site._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning for Active Session */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription>
            Changes to your blocklist will take effect on your next focus session. Currently active sessions will
            continue using the previous blocklist settings.
          </AlertDescription>
        </Alert>
      </div>
    </ProtectedLayout>
  )
}
