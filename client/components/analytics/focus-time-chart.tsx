"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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

interface FocusTimeChartProps {
  analyticsData: AnalyticsData
}

export default function FocusTimeChart({ analyticsData }: FocusTimeChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Prepare data for chart - using the new trendData format
  const focusTimeData = analyticsData.trendData.map((item) => ({
    name: formatDate(item.date),
    minutes: item.avgMinutes,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Time Trends</CardTitle>
        <CardDescription>Average focus time per session over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {focusTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusTimeData}>
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
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                              <span className="font-bold text-muted-foreground">{label}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Focus Time</span>
                              <span className="font-bold">{payload[0].value} minutes</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No focus time data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
