"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

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

interface SessionsChartProps {
  analyticsData: AnalyticsData
}

export default function SessionsChart({ analyticsData }: SessionsChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format week for display
  const formatWeek = (weekStr: string) => {
    const [year, week] = weekStr.split("-W")
    return `Week ${week}`
  }

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    return date.toLocaleDateString("en-US", { month: "long" })
  }

  // Prepare daily data for chart - now with status breakdown
  const dailyData = analyticsData.totalPomodoros.daily.map((item) => ({
    name: formatDate(item.date),
    completed: item.completed,
    interrupted: item.interrupted,
    aborted: item.aborted,
  }))

  // Prepare weekly data for chart
  const weeklyData = analyticsData.totalPomodoros.weekly.map((item) => ({
    name: formatWeek(item.week),
    sessions: item.count,
  }))

  // Prepare monthly data for chart
  const monthlyData = analyticsData.totalPomodoros.monthly.map((item) => ({
    name: formatMonth(item.month),
    sessions: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions Overview</CardTitle>
        <CardDescription>Number of focus sessions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const total = (payload[0]?.value || 0) + (payload[1]?.value || 0) + (payload[2]?.value || 0)
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                  <span className="font-bold text-muted-foreground">{label}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                                  <span className="font-bold">{total} sessions</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-green-600">Completed</span>
                                    <span className="font-bold">{payload[0]?.value || 0}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-yellow-500">Interrupted</span>
                                    <span className="font-bold">{payload[1]?.value || 0}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-red-600">Aborted</span>
                                    <span className="font-bold">{payload[2]?.value || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interrupted" name="Interrupted" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="aborted" name="Aborted" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No daily session data available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
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
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Week</span>
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
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No weekly session data available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
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
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
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
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No monthly session data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
