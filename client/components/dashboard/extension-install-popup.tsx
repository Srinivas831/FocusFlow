"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Chrome, Github, Shield, CheckCircle, AlertTriangle, Settings, FolderOpen, ToggleRight } from "lucide-react"

export default function ExtensionInstallPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if popup has been displayed before
    const hasDisplayedPopup = localStorage.getItem("displayedPopup")

    if (!hasDisplayedPopup || hasDisplayedPopup === "false") {
      // Show popup if not displayed before
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    // Mark popup as displayed
    localStorage.setItem("displayedPopup", "true")
    setIsOpen(false)
  }

  const handleOpenGitHub = () => {
    // Open GitHub repository (you'll need to replace with your actual repo URL)
    window.open("https://github.com/Srinivas831/FocusFlow", "_blank")
  }

  const handleOpenExtensions = () => {
    // Open Chrome extensions page
   // window.open("chrome://extensions/", "_blank")
    window.open("https://github.com/Srinivas831/FocusFlow", "_blank")
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Install FocusFlow Extension
            <Badge variant="destructive">Required</Badge>
          </DialogTitle>
          <DialogDescription>
            Follow these steps to manually install the FocusFlow browser extension for website blocking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Why it's needed */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Without the extension, website blocking won't work during your focus sessions.
            </AlertDescription>
          </Alert>

          {/* Step-by-step instructions */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Installation Steps:</h4>

            {/* Step 1 */}
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="font-medium">Download Extension from GitHub</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Go to our GitHub repository and download the <code className="bg-muted px-1 rounded">extension</code>{" "}
                  folder.
                </p>
                <Button variant="outline" size="sm" onClick={handleOpenGitHub} className="mt-2">
                  <Github className="h-4 w-4 mr-2" />
                  Open GitHub Repository
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  <span className="font-medium">Open Chrome Extensions</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type <code className="bg-muted px-1 rounded">chrome://extensions/</code> in your address bar or go to
                  Chrome menu → Extensions → Manage Extensions.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ToggleRight className="h-4 w-4" />
                  <span className="font-medium">Enable Developer Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle the <strong>"Developer mode"</strong> switch in the top-right corner of the extensions page.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-medium">Load Unpacked Extension</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click <strong>"Load unpacked"</strong> button and select the{" "}
                  <code className="bg-muted px-1 rounded">extension</code> folder you downloaded from GitHub.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Extension Installed!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The FocusFlow extension should now appear in your extensions list and be ready to block websites
                  during focus sessions.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* What the extension does */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">What the extension does:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Blocks websites during sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Syncs with your blocklist</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Tracks interruption attempts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Works with Pomodoro timer</span>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> If you encounter issues, make sure you've downloaded the entire extension
              folder and that Developer mode is enabled.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            I'll Install Later
          </Button>
          <Button onClick={handleOpenExtensions} className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            Open Chrome Extensions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
