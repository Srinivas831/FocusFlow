"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  _id: string
  userName: string
  email: string
  createdAt: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a token in localStorage on initial load
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    console.log("Auth check - Token:", !!storedToken, "User:", !!storedUser)

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      console.log("User authenticated from localStorage")

      // Redirect to dashboard if user is on login/signup pages
      const currentPath = window.location.pathname
      if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/") {
        console.log("Redirecting authenticated user to dashboard")
        router.push("/dashboard")
      }
    } else {
      console.log("No authentication found")
      // No token found, redirect to login if on protected routes
      const currentPath = window.location.pathname
      if (currentPath.startsWith("/dashboard")) {
        console.log("Redirecting unauthenticated user to login")
        router.push("/login")
      }
    }

    setIsLoading(false)
  }, [router])

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setToken(token)
    setUser(user)
    setIsAuthenticated(true)
  }

  // Update the logout function to clear notification-related data
  const logout = () => {
    console.log("Logging out, clearing all data")

    // Get current user ID before clearing
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    const userId = currentUser?._id || "guest"

    // Clear user-specific notification data
    localStorage.removeItem(`notificationSetupComplete_${userId}`)
    localStorage.removeItem(`notificationsEnabled_${userId}`)

    // Clear other data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("activeSession") // Clear session data on logout
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
