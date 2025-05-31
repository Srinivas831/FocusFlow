"use client"

import { useEffect, useState } from "react"
import ProtectedLayout from "@/components/layout/protected-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"
import { sessionAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import AnalyticsOverview from "@/components/analytics/analytics-overview"
import SessionsChart from "@/components/analytics/sessions-chart"
import FocusTimeChart from "@/components/analytics/focus-time-chart"
import SessionStatusChart from "@/components/analytics/session-status-chart"
import ProductivityPatterns from "@/components/analytics/productivity-patterns"

// Analytics data type definition based on the updated API response
interface AnalyticsData {
  totalPomodoros: {
    daily: {
      date: string
      count: number
      avgMinutes: number
      completed: number
      interrupted: number
      aborted: number
    }[]
    weekly: { week: string; count: number }[]
    monthly: { month: string; count: number }[]
    total: number
  }
  averageFocusTime: {
    daily: { date: string; avgMinutes: number }[]
    overall: number
  }
  sessionStatusStats: {
    completed: number
    interrupted: number
    aborted: number
  }
  productivityPatterns: {
    hourlyDistribution: number[]
    mostProductiveHour: number
    currentStreak: number
    longestStreak: number
  }
  trendData: {
    date: string
    count: number
    avgMinutes: number
    completed: number
    interrupted: number
    aborted: number
  }[]
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const data = await sessionAPI.getAnalytics()
        console.log("Analytics data:", data)
        setAnalyticsData(data)
      } catch (error: any) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Track your focus sessions and productivity insights</p>
        </div>

        {isLoading ? (
          // Loading state
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <>
            {/* Overview Stats */}
            <AnalyticsOverview
              totalSessions={analyticsData.totalPomodoros.total}
              averageFocusTime={analyticsData.averageFocusTime.overall}
              completionRate={
                analyticsData.totalPomodoros.total > 0
                  ? Math.round((analyticsData.sessionStatusStats.completed / analyticsData.totalPomodoros.total) * 100)
                  : 0
              }
              currentStreak={analyticsData.productivityPatterns.currentStreak}
            />

            {/* Tabs for different analytics views */}
            <Tabs defaultValue="sessions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="focus-time">Focus Time</TabsTrigger>
                <TabsTrigger value="status">Session Status</TabsTrigger>
                <TabsTrigger value="patterns">Productivity Patterns</TabsTrigger>
              </TabsList>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-4">
                <SessionsChart analyticsData={analyticsData} />
              </TabsContent>

              {/* Focus Time Tab */}
              <TabsContent value="focus-time" className="space-y-4">
                <FocusTimeChart analyticsData={analyticsData} />
              </TabsContent>

              {/* Session Status Tab */}
              <TabsContent value="status" className="space-y-4">
                <SessionStatusChart analyticsData={analyticsData} />
              </TabsContent>

              {/* Productivity Patterns Tab */}
              <TabsContent value="patterns" className="space-y-4">
                <ProductivityPatterns analyticsData={analyticsData} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // No data state
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No sessions yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start your first focus session to see analytics here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
