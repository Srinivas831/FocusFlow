"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { sessionAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export type BlocklistItem = {
  _id: string
  userId: string
  type: string
  value: string
  __v: number
}

type BlocklistContextType = {
  blocklist: BlocklistItem[]
  isLoading: boolean
  isAdding: boolean
  isRemoving: string | null
  fetchBlocklist: () => Promise<void>
  addToBlocklist: (websites: string[]) => Promise<void>
  removeFromBlocklist: (id: string) => Promise<void>
  isWebsiteBlocked: (website: string) => boolean
}

const BlocklistContext = createContext<BlocklistContextType | undefined>(undefined)

export function BlocklistProvider({ children }: { children: ReactNode }) {
  const [blocklist, setBlocklist] = useState<BlocklistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  const fetchBlocklist = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping blocklist fetch")
      return
    }

    setIsLoading(true)
    try {
      console.log("Fetching blocklist...")
      const data = await sessionAPI.getBlocklist()
      console.log("Blocklist fetched:", data)
      setBlocklist(data)
      return data // Return the data for immediate use if needed
    } catch (error: any) {
      console.error("Error fetching blocklist:", error)
      toast({
        title: "Error",
        description: "Failed to load blocklist",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  const sendBlocklistToExtension = useCallback((currentBlocklist: BlocklistItem[]) => {
    try {
      // Use the current blocklist data - no need for another API call
      console.log("Sending blocklist to extension:", currentBlocklist)

      // Send to Chrome extension
      window.postMessage({ type: "UPDATE_BLOCKLIST", payload: currentBlocklist }, "*")
      console.log("Sent UPDATE_BLOCKLIST to Chrome extension")
    } catch (error) {
      console.error("Error sending blocklist to extension:", error)
    }
  }, [])

  const isWebsiteBlocked = useCallback(
    (website: string) => {
      return blocklist.some((item) => item.value.toLowerCase() === website.toLowerCase())
    },
    [blocklist],
  )

  const addToBlocklist = async (websites: string[]) => {
    if (!websites || websites.length === 0) {
      toast({
        title: "No websites provided",
        description: "Please add at least one website to block",
        variant: "destructive",
      })
      return
    }

    // Clean up and validate websites
    const cleanWebsites = websites
      .map((website) =>
        website
          .toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/, "")
          .split("/")[0] // Remove any paths
          .trim(),
      )
      .filter((website) => {
        // Basic validation
        if (!website || !website.includes(".")) {
          return false
        }
        return true
      })

    if (cleanWebsites.length === 0) {
      toast({
        title: "Invalid websites",
        description: "Please enter valid website domains (e.g., facebook.com)",
        variant: "destructive",
      })
      return
    }

    // Check for duplicates
    const duplicates = cleanWebsites.filter((website) => isWebsiteBlocked(website))
    if (duplicates.length > 0) {
      toast({
        title: "Already blocked",
        description: `${duplicates.join(", ")} ${duplicates.length === 1 ? "is" : "are"} already in your blocklist`,
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      console.log("Adding to blocklist:", cleanWebsites)
      const response = await sessionAPI.addToBlocklist(cleanWebsites)
      console.log("Added to blocklist:", response)

      // Refresh blocklist and get the updated data
      const updatedBlocklist = await fetchBlocklist()

      // Send the updated blocklist to Chrome extension
      sendBlocklistToExtension(updatedBlocklist || [])

      toast({
        title: "Websites blocked",
        description: `${cleanWebsites.length} website${cleanWebsites.length === 1 ? "" : "s"} added to your blocklist`,
      })
    } catch (error: any) {
      console.error("Error adding to blocklist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add websites to blocklist",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const removeFromBlocklist = async (id: string) => {
    setIsRemoving(id)
    try {
      console.log("Removing from blocklist, ID:", id)
      await sessionAPI.removeFromBlocklist(id)
      console.log("Removed from blocklist")

      // Update local state
      const updatedBlocklist = blocklist.filter((item) => item._id !== id)
      setBlocklist(updatedBlocklist)

      // Send updated blocklist to Chrome extension
      sendBlocklistToExtension(updatedBlocklist)

      toast({
        title: "Website unblocked",
        description: "Website has been removed from your blocklist",
      })
    } catch (error: any) {
      console.error("Error removing from blocklist:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove website from blocklist",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(null)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchBlocklist()
    }
  }, [isAuthenticated, fetchBlocklist])

  return (
    <BlocklistContext.Provider
      value={{
        blocklist,
        isLoading,
        isAdding,
        isRemoving,
        fetchBlocklist,
        addToBlocklist,
        removeFromBlocklist,
        isWebsiteBlocked,
      }}
    >
      {children}
    </BlocklistContext.Provider>
  )
}

export function useBlocklist() {
  const context = useContext(BlocklistContext)
  if (context === undefined) {
    throw new Error("useBlocklist must be used within a BlocklistProvider")
  }
  return context
}
