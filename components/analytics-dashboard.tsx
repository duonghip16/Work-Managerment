"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Clock, CheckCircle2, AlertTriangle } from "lucide-react"

interface Task {
  id?: string
  title: string
  description?: string
  completed: boolean
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  startTime?: string
  endTime?: string
  tags: string[]
  category?: string
  completedAt?: string
  completionPhoto?: string
}

interface AnalyticsDashboardProps {
  tasks: Task[]
}

export function AnalyticsDashboard({ tasks }: AnalyticsDashboardProps) {
  // Calculate analytics data
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const todoTasks = tasks.filter((task) => task.status === "todo").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const tasksWithPhotos = tasks.filter(t => t.completionPhoto).length
  const photoRate = completedTasks > 0 ? Math.round((tasksWithPhotos / completedTasks) * 100) : 0

  // Priority distribution
  const priorityData = [
    { name: "Cao", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
    { name: "Trung bình", value: tasks.filter((t) => t.priority === "medium").length, color: "#f97316" },
    { name: "Thấp", value: tasks.filter((t) => t.priority === "low").length, color: "#22c55e" },
  ]

  // Category distribution
  const categoryData = tasks.reduce(
    (acc, task) => {
      const category = task.category || "Khác"
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  // Weekly completion trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]
    const dateStr = date.toISOString().split('T')[0]
    
    const completed = tasks.filter(task => 
      task.completedAt && task.completedAt.split('T')[0] === dateStr
    ).length
    
    // Estimate created tasks based on due date (since we don't have creation date)
    const created = tasks.filter(task => 
      task.dueDate === dateStr
    ).length
    
    return { name: dayName, completed, created, date: dateStr }
  })

  // Overdue tasks
  const overdueTasks = tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== "completed").length

  // Due soon tasks (next 3 days)
  const dueSoonTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    return dueDate <= threeDaysFromNow && dueDate >= new Date() && task.status !== "completed"
  }).length

  // Status distribution
  const statusData = [
    { name: "Chưa bắt đầu", value: todoTasks, color: "#6b7280" },
    { name: "Đang thực hiện", value: inProgressTasks, color: "#3b82f6" },
    { name: "Đã hoàn thành", value: completedTasks, color: "#10b981" },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Tỷ lệ hoàn thành</CardTitle>
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-200">{completionRate}%</div>
            <Progress value={completionRate} className="mt-3 h-2" />
            <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
              {completedTasks}/{totalTasks} công việc
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">Quá hạn</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">{overdueTasks}</div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3 font-medium">Cần xử lý ngay</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Sắp hết hạn</CardTitle>
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{dueSoonTasks}</div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-3 font-medium">Trong 3 ngày tới</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Có ảnh chứng minh</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{photoRate}%</div>
            <Progress value={photoRate} className="mt-3 h-2" />
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-3 font-medium">
              {tasksWithPhotos}/{completedTasks} task hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-t-lg">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Phân bố trạng thái công việc
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Tổng quan về trạng thái các công việc</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {statusData.map((item, index) => {
                const percentage = totalTasks > 0 ? (item.value / totalTasks) * 100 : 0
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full shadow-sm`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold min-w-[2rem] text-right">{item.value}</span>
                      <div className="w-28">
                        <Progress value={percentage} className="h-2.5" />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right font-medium">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg">
            <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Xu hướng hoàn thành theo tuần
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">So sánh công việc được tạo và hoàn thành</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span>Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                  <span>Tạo mới</span>
                </div>
              </div>
              <div className="flex items-end justify-between h-48 gap-3 bg-muted/20 rounded-lg p-4">
                {last7Days.map((day, index) => {
                  const maxValue = Math.max(...last7Days.map(d => Math.max(d.completed, d.created)), 1)
                  const completedHeight = (day.completed / maxValue) * 80
                  const createdHeight = (day.created / maxValue) * 80
                  return (
                    <div key={index} className="flex flex-col items-center gap-3 flex-1">
                      <div className="flex items-end gap-2 h-32">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold mb-2 text-green-700 dark:text-green-300">{day.completed}</span>
                          <div 
                            className="bg-green-500 rounded-t-lg w-5 min-h-[4px] shadow-sm transition-all duration-300 hover:bg-green-600"
                            style={{ height: `${completedHeight}%` }}
                          ></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold mb-2 text-blue-700 dark:text-blue-300">{day.created}</span>
                          <div 
                            className="bg-blue-500 rounded-t-lg w-5 min-h-[4px] shadow-sm transition-all duration-300 hover:bg-blue-600"
                            style={{ height: `${createdHeight}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground">{day.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {categoryChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo danh mục</CardTitle>
            <CardDescription>Số lượng công việc theo từng danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryChartData.sort((a, b) => b.value - a.value).slice(0, 8).map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500']
                const percentage = totalTasks > 0 ? (category.value / totalTasks) * 100 : 0
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${colors[index]} rounded`}></div>
                      <span className="text-sm font-medium truncate max-w-[120px]">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{category.value}</span>
                      <div className="w-20">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Tổng quan về các công việc và trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === "completed" ? "bg-green-500" :
                    task.status === "in-progress" ? "bg-blue-500" : "bg-gray-400"
                  }`} />
                  <div>
                    <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString("vi-VN")} • 
                      {task.status === "completed" ? "Hoàn thành" :
                       task.status === "in-progress" ? "Đang làm" : "Chưa bắt đầu"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.completionPhoto && (
                    <Badge variant="outline" className="text-xs text-purple-600">
                      📷
                    </Badge>
                  )}
                  {task.category && (
                    <Badge variant="secondary" className="text-xs">
                      {task.category}
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : task.priority === "medium"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {task.priority === "high" ? "Cao" : task.priority === "medium" ? "TB" : "Thấp"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
