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
  createdAt?: any
}

interface AnalyticsDashboardProps {
  tasks: Task[]
  onFilterClick?: (filterType: string) => void
}

export function AnalyticsDashboard({ tasks, onFilterClick }: AnalyticsDashboardProps) {
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

  // Weekly completion trend (last 7 days starting from Monday)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const today = new Date()
    const currentDayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1 // Convert to Monday = 0
    const date = new Date(today)
    date.setDate(today.getDate() - daysFromMonday + i)
    const dayName = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]
    const dateStr = date.toISOString().split('T')[0]
    
    const completed = tasks.filter(task => 
      task.completedAt && task.completedAt.split('T')[0] === dateStr
    ).length
    
    // Count tasks created on this date using Firebase createdAt timestamp
    const created = tasks.filter(task => {
      if (!task.createdAt) return false
      const createdDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
      return createdDate.toISOString().split('T')[0] === dateStr
    }).length
    
    return { name: dayName, completed, created, date: dateStr }
  })

  // Overdue tasks (past due date and time)
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "completed") return false
    
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    
    // If task has end time, use it as deadline
    if (task.endTime) {
      const [hours, minutes] = task.endTime.split(':')
      dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    } else {
      // If no end time, deadline is end of day
      dueDate.setHours(23, 59, 59, 999)
    }
    
    return now > dueDate
  }).length

  // Due soon tasks (today and tomorrow)
  const dueSoonTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)
    return dueDate >= today && dueDate <= tomorrow && task.status !== "completed"
  }).length

  // Status distribution
  const statusData = [
    { name: "Chưa bắt đầu", value: todoTasks, color: "#6b7280" },
    { name: "Đang thực hiện", value: inProgressTasks, color: "#3b82f6" },
    { name: "Đã hoàn thành", value: completedTasks, color: "#10b981" },
  ]

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-2 sm:px-0">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        <Card className="shadow-sm sm:shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 lg:pb-3 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Hoàn thành</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200">{completionRate}%</div>
            <Progress value={completionRate} className="mt-1 sm:mt-2 lg:mt-3 h-1.5 sm:h-2" />
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1 sm:mt-2 lg:mt-3 font-medium">
              {completedTasks}/{totalTasks}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:shadow-lg border-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onFilterClick?.("overdue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 lg:pb-3 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Quá hạn</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-700 dark:text-red-300">{overdueTasks}</div>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1 sm:mt-2 lg:mt-3 font-medium">Cần xử lý</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onFilterClick?.("due-soon")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 lg:pb-3 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-300">Sắp hết</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700 dark:text-orange-300">{dueSoonTasks}</div>
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1 sm:mt-2 lg:mt-3 font-medium">Hôm nay</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onFilterClick?.("completed")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 lg:pb-3 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">Xong</CardTitle>
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 dark:text-purple-300">{completedTasks}</div>
            <Progress value={completionRate} className="mt-1 sm:mt-2 lg:mt-3 h-1.5 sm:h-2" />
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mt-1 sm:mt-2 lg:mt-3 font-medium">
              {completedTasks}/{totalTasks}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Status Distribution */}
        <Card className="shadow-sm sm:shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-t-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              <span className="hidden sm:inline">Phân bố trạng thái công việc</span>
              <span className="sm:hidden">Trạng thái</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">Tổng quan về trạng thái các công việc</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6">
            <div className="space-y-2 sm:space-y-3 lg:space-y-5">
              {statusData.map((item, index) => {
                const percentage = totalTasks > 0 ? (item.value / totalTasks) * 100 : 0
                return (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs sm:text-sm font-semibold truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <span className="text-xs sm:text-sm font-bold min-w-[1.5rem] sm:min-w-[2rem] text-right">{item.value}</span>
                      <div className="w-16 sm:w-20 lg:w-28">
                        <Progress value={percentage} className="h-1.5 sm:h-2 lg:h-2.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-10 lg:w-12 text-right font-medium">
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
        <Card className="shadow-sm sm:shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-t-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              <span className="hidden sm:inline">Xu hướng hoàn thành theo tuần</span>
              <span className="sm:hidden">Xu hướng tuần</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hidden sm:block">So sánh công việc được tạo và hoàn thành</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6">
            <div className="space-y-2 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="hidden sm:inline">Hoàn thành</span>
                  <span className="sm:hidden">Xong</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="hidden sm:inline">Tạo mới</span>
                  <span className="sm:hidden">Tạo</span>
                </div>
              </div>
              <div className="flex items-end justify-between h-24 sm:h-32 lg:h-48 gap-0.5 sm:gap-1 lg:gap-3 bg-muted/20 rounded-lg p-1 sm:p-2 lg:p-4">
                {last7Days.map((day, index) => {
                  const maxValue = Math.max(...last7Days.map(d => Math.max(d.completed, d.created)), 1)
                  const completedHeight = (day.completed / maxValue) * 80
                  const createdHeight = (day.created / maxValue) * 80
                  return (
                    <div key={index} className="flex flex-col items-center gap-0.5 sm:gap-1 lg:gap-3 flex-1">
                      <div className="flex items-end gap-0.5 sm:gap-1 lg:gap-2 h-16 sm:h-20 lg:h-32">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold mb-0.5 sm:mb-1 lg:mb-2 text-green-700 dark:text-green-300">{day.completed}</span>
                          <div 
                            className="bg-green-500 rounded-t-lg w-2 sm:w-3 lg:w-5 min-h-[2px] sm:min-h-[4px] shadow-sm transition-all duration-300 hover:bg-green-600"
                            style={{ height: `${completedHeight}%` }}
                          ></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold mb-0.5 sm:mb-1 lg:mb-2 text-blue-700 dark:text-blue-300">{day.created}</span>
                          <div 
                            className="bg-blue-500 rounded-t-lg w-2 sm:w-3 lg:w-5 min-h-[2px] sm:min-h-[4px] shadow-sm transition-all duration-300 hover:bg-blue-600"
                            style={{ height: `${createdHeight}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-muted-foreground">{day.name}</div>
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
        <Card className="shadow-sm sm:shadow-lg">
          <CardHeader className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Phân bố theo danh mục</CardTitle>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">Số lượng công việc theo từng danh mục</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
            <div className="space-y-2 sm:space-y-3">
              {categoryChartData.sort((a, b) => b.value - a.value).slice(0, 6).map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
                const percentage = totalTasks > 0 ? (category.value / totalTasks) * 100 : 0
                return (
                  <div key={category.name} className="flex items-center justify-between p-2 sm:p-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colors[index]} rounded`}></div>
                      <span className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-[120px]">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-bold">{category.value}</span>
                      <div className="w-12 sm:w-16 lg:w-20">
                        <Progress value={percentage} className="h-1.5 sm:h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 sm:w-8">
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
      <Card className="shadow-sm sm:shadow-lg">
        <CardHeader className="px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Hoạt động gần đây</CardTitle>
          <CardDescription className="text-xs sm:text-sm hidden sm:block">Tổng quan về các công việc và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                    task.status === "completed" ? "bg-green-500" :
                    task.status === "in-progress" ? "bg-blue-500" : "bg-gray-400"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString("vi-VN")} • 
                      {task.status === "completed" ? "Xong" :
                       task.status === "in-progress" ? "Làm" : "Chờ"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {task.completionPhoto && (
                    <Badge variant="outline" className="text-xs px-1 py-0.5">
                      📷
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs px-1 py-0.5 ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : task.priority === "medium"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢"}
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
