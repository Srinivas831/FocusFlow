"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, Award } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

interface ProductivityPatternsProps {
  analyticsData: AnalyticsData
}

export default function ProductivityPatterns({ analyticsData }: ProductivityPatternsProps) {
  // Format hour for display
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM"
    const h = hour % 12 || 12
    return `${h} ${ampm}`
  }

  // Create hourly distribution data from the actual data
  const hourlyData = analyticsData.productivityPatterns.hourlyDistribution.map((count, hour) => ({
    name: formatHour(hour),
    sessions: count,
  }))

  // Filter to only show hours with data or business hours for better visualization
  const filteredHourlyData = hourlyData.filter((item) => item.sessions > 0)

  // Get most productive hour
  const mostProductiveHour = analyticsData.productivityPatterns.mostProductiveHour
  const mostProductiveHourFormatted = formatHour(mostProductiveHour)

  // Get streak data
  const currentStreak = analyticsData.productivityPatterns.currentStreak
  const longestStreak = analyticsData.productivityPatterns.longestStreak

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Productivity by Time of Day</CardTitle>
          <CardDescription>When you're most productive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {filteredHourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                                <span className="font-bold text-muted-foreground">{label}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Sessions</span>
                                <span className="font-bold">{payload[0].value}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No productivity pattern data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Productive Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostProductiveHourFormatted}</div>
            <p className="text-xs text-muted-foreground">Based on session frequency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">Consecutive days with sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Your best consistency record</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
