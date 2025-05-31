"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useSession } from "@/context/session-context"
import AbortSessionModal from "./abort-session-modal"

export default function SessionControls() {
  const { stopSession, abortSession, isAborting } = useSession()
  const [showAbortModal, setShowAbortModal] = useState(false)

  const handleAbortClick = () => {
    setShowAbortModal(true)
  }

  const handleAbortConfirm = async (reason: string) => {
    await abortSession(reason)
    setShowAbortModal(false)
  }

  const handleAbortCancel = () => {
    setShowAbortModal(false)
  }

  return (
    <>
      <div className="flex gap-4 justify-center">
        {/* Stop button commented out - keeping abort only */}
        {/* <Button onClick={stopSession} variant="default" size="lg" disabled={isAborting}>
          <Square className="mr-2 h-5 w-5" />
          Stop Session
        </Button> */}

        <Button onClick={handleAbortClick} variant="destructive" size="lg" disabled={isAborting}>
          <X className="mr-2 h-5 w-5" />
          Abort Session
        </Button>
      </div>

      <AbortSessionModal
        isOpen={showAbortModal}
        onClose={handleAbortCancel}
        onConfirm={handleAbortConfirm}
        isAborting={isAborting}
      />
    </>
  )
}
