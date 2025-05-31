"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle } from "lucide-react"

interface AbortSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  isAborting: boolean
}

const ABORT_REASONS = [
  "Urgent interruption",
  "Emergency situation",
  "Technical issues",
  "Feeling unwell",
  "Lost motivation",
  "Distraction too strong",
  "Wrong session settings",
  "Need to take a call",
  "Other",
]

export default function AbortSessionModal({ isOpen, onClose, onConfirm, isAborting }: AbortSessionModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  const handleConfirm = async () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason
    if (reason.trim()) {
      await onConfirm(reason.trim())
      // Reset form
      setSelectedReason("")
      setCustomReason("")
    }
  }

  const handleClose = () => {
    if (!isAborting) {
      setSelectedReason("")
      setCustomReason("")
      onClose()
    }
  }

  const isFormValid = () => {
    if (selectedReason === "Other") {
      return customReason.trim().length > 0
    }
    return selectedReason.length > 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Abort Focus Session
          </DialogTitle>
          <DialogDescription>
            Please tell us why you're ending this session early. This helps us improve your focus experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for aborting *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason} disabled={isAborting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {ABORT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Please specify *</Label>
              <Textarea
                id="customReason"
                placeholder="Tell us more about why you're aborting this session..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={isAborting}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{customReason.length}/200 characters</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isAborting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!isFormValid() || isAborting}>
            {isAborting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aborting...
              </>
            ) : (
              "Abort Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
