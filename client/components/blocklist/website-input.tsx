"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2 } from "lucide-react"

interface WebsiteInputProps {
  onAddWebsites: (websites: string[]) => Promise<void>
  isAdding: boolean
}

export default function WebsiteInput({ onAddWebsites, isAdding }: WebsiteInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [websites, setWebsites] = useState<string[]>([])

  const addWebsite = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !websites.includes(trimmedValue)) {
      setWebsites([...websites, trimmedValue])
      setInputValue("")
    }
  }

  const removeWebsite = (websiteToRemove: string) => {
    setWebsites(websites.filter((website) => website !== websiteToRemove))
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addWebsite()
    }
  }

  const handleAddAll = async () => {
    if (websites.length > 0) {
      await onAddWebsites(websites)
      setWebsites([]) // Clear the list after successful addition
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            placeholder="example.com"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAdding}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter domain and press Enter to add (e.g., facebook.com, youtube.com)
          </p>
        </div>
        <div className="flex items-end">
          <Button onClick={addWebsite} disabled={!inputValue.trim() || isAdding} variant="outline" size="default">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Website Tags */}
      {websites.length > 0 && (
        <div className="space-y-2">
          <Label>Websites to block ({websites.length})</Label>
          <div className="flex flex-wrap gap-2">
            {websites.map((website, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {website}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeWebsite(website)} />
              </Badge>
            ))}
          </div>
          <Button onClick={handleAddAll} disabled={isAdding} className="w-full">
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding {websites.length} website{websites.length === 1 ? "" : "s"}...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add {websites.length} Website{websites.length === 1 ? "" : "s"} to Blocklist
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
