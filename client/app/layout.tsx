import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { SessionProvider } from "@/context/session-context"
import { BlocklistProvider } from "@/context/blocklist-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FocusFlow - Pomodoro & Distraction Blocker",
  description: "Boost your productivity with FocusFlow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionProvider>
              <BlocklistProvider>
                {children}
                <Toaster />
              </BlocklistProvider>
            </SessionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
