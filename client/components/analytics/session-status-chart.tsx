"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  totalPomodoros: {
    daily: { date: string; count: number }[]
    weekly: { week: string; count: number }[]
    total?: number
  }
  averageFocusTime: {
    daily: { date: string; avgMinutes: number }[]
    overall?: number
  }
  sessionStatusStats: {
    completed: number
    interrupted: number
    aborted: number
  }
  trendData: {
    labels: string[]
    durations: number[]
  }
  productivityPatterns?: {
    hourlyDistribution: number[]
    mostProductiveHour: number
    currentStreak: number
    longestStreak: number
  }
}

interface SessionStatusChartProps {
  analyticsData: AnalyticsData
}

export default function SessionStatusChart({ analyticsData }: SessionStatusChartProps) {
  const { completed, interrupted, aborted } = analyticsData.sessionStatusStats
  const total = completed + interrupted + aborted

  // Calculate percentages
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0
  const interruptedPercent = total > 0 ? Math.round((interrupted / total) * 100) : 0
  const abortedPercent = total > 0 ? Math.round((aborted / total) * 100) : 0

  // Prepare data for pie chart
  const pieData = [
    { name: "Completed", value: completed, color: "hsl(142.1 76.2% 36.3%)" },
    { name: "Interrupted", value: interrupted, color: "hsl(48 96% 53%)" },
    { name: "Aborted", value: aborted, color: "hsl(var(--destructive))" },
  ].filter((item) => item.value > 0) // Only show segments with data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Outcomes</CardTitle>
        <CardDescription>Distribution of session completion status</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-[250px] h-[250px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Status</span>
                              <span className="font-bold text-muted-foreground">{data.name}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Count</span>
                              <span className="font-bold">{data.value} sessions</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No session data available</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-muted-foreground">
                {completed} sessions ({completedPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-black">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Interrupted</p>
              <p className="text-xs text-muted-foreground">
                {interrupted} sessions ({interruptedPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Aborted</p>
              <p className="text-xs text-muted-foreground">
                {aborted} sessions ({abortedPercent}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
