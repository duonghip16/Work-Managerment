"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Plus, BarChart3, List, Download, Upload, Calendar, ArrowUpDown, Columns3, Home, Edit, Trash2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TaskForm } from "@/components/task-form"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { OnboardingTour } from "@/components/onboarding-tour"
import { SearchFilter } from "@/components/search-filter"
import { KanbanBoard } from "@/components/kanban-board"
import { KanbanBoardVertical } from "@/components/kanban-board-vertical"
import { CalendarView } from "@/components/calendar-view"
import { PhotoCaptureModal } from "@/components/photo-capture-modal"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { TaskEditModal } from "@/components/task-edit-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getTasks, addTask as addTaskToFirestore, updateTask as updateTaskInFirestore, deleteTask as deleteTaskFromFirestore, subscribeToTasks, Task } from "@/services/taskService"
import { cn } from "@/lib/utils"



export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("taskflow-onboarding-seen")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem("taskflow-onboarding-seen", "true")
  }

  return (
    <>
      <DashboardPage />
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
    </>
  )
}

function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load tasks from Firestore and subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToTasks((firestoreTasks) => {
      setTasks(firestoreTasks)
    })
    
    return () => unsubscribe()
  }, [])

  const [filter, setFilter] = useState("all")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentView, setCurrentView] = useState<"tasks" | "analytics" | "calendar" | "kanban" | "carousel">("tasks")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true)

  useEffect(() => {
    setFilteredTasks(tasks)
  }, [tasks])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!shortcutsEnabled || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          setShowTaskForm(true)
          toast.success("⌨️ Nhấn N để thêm task mới")
          break
        case 'k':
          e.preventDefault()
          setCurrentView('kanban')
          break
        case 'l':
          e.preventDefault()
          setCurrentView('tasks')
          break
        case 'c':
          e.preventDefault()
          setCurrentView('calendar')
          break
        case 'a':
          e.preventDefault()
          setCurrentView('analytics')
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [shortcutsEnabled])

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log('Dữ liệu task:', taskData)
      await addTaskToFirestore(taskData)
      setShowTaskForm(false)
      toast.success("✅ Đã thêm task thành công!")
    } catch (error) {
      console.error('Lỗi khi thêm task:', error)
      toast.error(`❌ Lỗi khi thêm task: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("📁 Đã xuất dữ liệu thành công!")
  }

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedTasks = JSON.parse(e.target?.result as string)
        if (Array.isArray(importedTasks)) {
          for (const task of importedTasks) {
            const { id, createdAt, updatedAt, ...taskData } = task
            await addTaskToFirestore(taskData)
          }
          toast.success(`📥 Đã nhập thành công ${importedTasks.length} task!`)
        }
      } catch (error) {
        toast.error('❌ File không hợp lệ!')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const updateTask = async (updatedTask: Task) => {
    try {
      if (updatedTask.id) {
        await updateTaskInFirestore(updatedTask.id, updatedTask)
        setEditingTask(null)
        toast.success("✏️ Đã cập nhật task thành công!")
      }
    } catch (error) {
      toast.error("❌ Lỗi khi cập nhật task!")
    }
  }

  const toggleTask = async (id: string, targetStatus?: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    let newStatus: "todo" | "in-progress" | "completed"
    let shouldClearCompletion = false

    // If targetStatus is provided, use it directly
    if (targetStatus) {
      newStatus = targetStatus as "todo" | "in-progress" | "completed"
      
      if (newStatus === "completed" && task.status === "in-progress") {
        // Require photo for completion from in-progress
        setTaskToComplete(task)
        setShowPhotoCapture(true)
        return
      }
      
      shouldClearCompletion = newStatus !== "completed"
      
      if (newStatus === "todo") {
        toast.success("🔄 Đã chuyển về Todo")
      } else if (newStatus === "in-progress") {
        toast.success("🟡 Đã bắt đầu làm việc!")
      }
    } else {
      // Default workflow: todo -> in-progress -> completed -> todo
      switch (task.status) {
        case "todo":
          newStatus = "in-progress"
          shouldClearCompletion = true
          toast.success("🟡 Đã bắt đầu làm việc!")
          break
        case "in-progress":
          // Require photo for completion
          setTaskToComplete(task)
          setShowPhotoCapture(true)
          return
        case "completed":
          newStatus = "todo"
          shouldClearCompletion = true
          toast.success("🔄 Đã đặt lại trạng thái")
          break
        default:
          return
      }
    }

    try {
      const updateData: any = {
        status: newStatus,
        completed: newStatus === "completed"
      }
      
      if (shouldClearCompletion) {
        updateData.completedAt = null
        updateData.completionPhoto = null
      }
      
      await updateTaskInFirestore(id, updateData)
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error)
      toast.error(`❌ Lỗi khi cập nhật trạng thái: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handlePhotoCapture = async (photoData: string) => {
    if (taskToComplete && taskToComplete.id) {
      const completedAt = new Date().toISOString()
      
      try {
        await updateTaskInFirestore(taskToComplete.id, {
          status: "completed",
          completed: true,
          completedAt,
          completionPhoto: photoData
        })
        
        // Handle recurring task
        if (taskToComplete.recurring && taskToComplete.recurring !== "none") {
          const newTask = createRecurringTask(taskToComplete)
          if (newTask) {
            await addTaskToFirestore(newTask)
            toast.success("✅ Hoàn thành và tạo task lặp lại!")
          }
        } else {
          toast.success("✅ Đã hoàn thành task và lưu ảnh!")
        }
        
        setTaskToComplete(null)
      } catch (error) {
        toast.error("❌ Lỗi khi hoàn thành task!")
      }
    }
    setShowPhotoCapture(false)
  }

  const createRecurringTask = (task: Task): Task | null => {
    if (!task.recurring || task.recurring === "none") return null
    
    const today = new Date()
    let nextDate = new Date(task.dueDate)
    
    switch (task.recurring) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }
    
    return {
      ...task,
      id: undefined,
      status: "todo",
      completed: false,
      dueDate: nextDate.toISOString().split('T')[0],
      completedAt: undefined,
      completionPhoto: undefined,
      lastRecurringDate: today.toISOString().split('T')[0]
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromFirestore(id)
      toast.success("🗑️ Đã xóa task thành công!")
    } catch (error) {
      toast.error("❌ Lỗi khi xóa task!")
    }
  }

  const editTask = (task: Task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const viewTaskDetail = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleAnalyticsFilter = (filterType: string) => {
    setCurrentView("tasks")
    setFilter(filterType)
  }

  const getDisplayTasks = () => {
    const tasksToFilter = searchTerm ? filteredTasks : tasks

    let filtered = tasksToFilter.filter((task) => {
      if (filter === "completed") return task.status === "completed"
      if (filter === "pending") return task.status === "in-progress"
      if (filter === "high") return task.priority === "high"
      if (filter === "overdue") {
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
      }
      if (filter === "due-soon") {
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(23, 59, 59, 999)
        return dueDate >= today && dueDate <= tomorrow && task.status !== "completed"
      }
      if (filter === "with-photo") {
        return task.status === "completed" && task.completionPhoto
      }
      return true
    })

    // Sort tasks
    return filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate + (a.startTime ? ` ${a.startTime}` : ''))
        const dateB = new Date(b.dueDate + (b.startTime ? ` ${b.startTime}` : ''))
        comparison = dateA.getTime() - dateB.getTime()
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
      } else if (sortBy === "created") {
        // For string IDs, use localeCompare for proper sorting
        comparison = (a.id || '').localeCompare(b.id || '')
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })
  }

  const displayTasks = getDisplayTasks()
  const completedCount = tasks.filter((task) => task.status === "completed").length
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length
  const todoCount = tasks.filter((task) => task.status === "todo").length
  const overdueCount = tasks.filter((task) => {
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
  const dueSoonCount = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)
    return dueDate >= today && dueDate <= tomorrow && task.status !== "completed"
  }).length
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="modern-navbar border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Work management" className="h-6 w-6 md:h-8 md:w-8 cursor-pointer logo-bounce" onClick={() => window.location.reload()} />
              <h1 className="text-lg md:text-2xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => window.location.reload()}>Work Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs px-2 py-1 h-6 hidden sm:flex nav-button ${shortcutsEnabled ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setShortcutsEnabled(!shortcutsEnabled)}
                title={shortcutsEnabled ? "Tắt shortcuts" : "Bật shortcuts"}
              >
                ⌨️ {shortcutsEnabled ? 'ON' : 'OFF'}
              </Button>
              <div className="hidden sm:flex items-center gap-1 font-mono text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  {isClient ? currentTime.toLocaleTimeString('en-US', { 
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '--:--'}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation Bar */}
      <nav className="modern-navbar border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Button
                variant={currentView === "tasks" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("tasks")}
                className={`flex-shrink-0 nav-button ${currentView === "tasks" ? "active" : ""}`}
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Danh sách</span>
              </Button>
              <Button
                variant={currentView === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("kanban")}
                className={`flex-shrink-0 nav-button ${currentView === "kanban" ? "active" : ""}`}
              >
                <Columns3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button
                variant={currentView === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("calendar")}
                className={`flex-shrink-0 nav-button ${currentView === "calendar" ? "active" : ""}`}
              >
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Lịch</span>
              </Button>
              <Button
                variant={currentView === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("analytics")}
                className={`flex-shrink-0 nav-button ${currentView === "analytics" ? "active" : ""}`}
              >
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Thống kê</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportTasks} className="flex-shrink-0 nav-button">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Xuất</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="flex-shrink-0 nav-button">
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nhập</span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={importTasks}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 md:py-8">
        {currentView === "analytics" ? (
          <AnalyticsDashboard tasks={tasks} onFilterClick={handleAnalyticsFilter} />
        ) : currentView === "kanban" ? (
          <>
            <KanbanBoardVertical
              tasks={displayTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
              onViewDetail={viewTaskDetail}
            />
          </>
        ) : currentView === "calendar" ? (
          <>

            <CalendarView tasks={tasks} onEdit={editTask} />
          </>
        ) : (
          <>
            {/* Professional Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 md:pb-3 relative z-10 px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Tổng</CardTitle>
                  <div className="p-1 sm:p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-0.5 sm:mb-1">{tasks.length}</div>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">Tasks</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950/20 dark:to-slate-950/30 border-gray-200/50 dark:border-gray-800/30 hover:shadow-lg hover:shadow-gray-500/10 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 md:pb-3 relative z-10 px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Todo</CardTitle>
                  <div className="p-1 sm:p-2 bg-gray-500/10 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                    <div className="text-sm sm:text-lg">⏳</div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-0.5 sm:mb-1">{todoCount}</div>
                  <p className="text-xs text-gray-600/80 dark:text-gray-400/80 font-medium">Chờ</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/20 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 md:pb-3 relative z-10 px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Doing</CardTitle>
                  <div className="p-1 sm:p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <div className="text-sm sm:text-lg">⚡</div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-0.5 sm:mb-1">{inProgressCount}</div>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">Làm</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 md:pb-3 relative z-10 px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Done</CardTitle>
                  <div className="p-1 sm:p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200 mb-0.5 sm:mb-1">{completedCount}</div>
                  <p className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">Xong</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/20 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/30 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group col-span-2 sm:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 md:pb-3 relative z-10 px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Overdue</CardTitle>
                  <div className="p-1 sm:p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <div className="text-sm sm:text-lg">⚠️</div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-800 dark:text-red-200 mb-0.5 sm:mb-1">{overdueCount}</div>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">Trễ</p>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            {!showTaskForm && (
              <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <Button onClick={() => setShowTaskForm(true)} size="default" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm công việc mới
                  </Button>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} className="w-full sm:w-auto">
                      Tìm kiếm nâng cao
                    </Button>
                    {currentView === "tasks" && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ArrowUpDown className="h-4 w-4" />
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dueDate">Deadline</SelectItem>
                            <SelectItem value="priority">Ưu tiên</SelectItem>
                            <SelectItem value="created">Tạo mới</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="flex-shrink-0"
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Search Filter */}
            {showAdvancedFilter && (
              <div className="mb-6">
                <SearchFilter tasks={tasks} onFilteredTasks={setFilteredTasks} onSearchChange={setSearchTerm} />
              </div>
            )}



            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={setFilter} className="mb-4 md:mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-xs sm:text-sm h-auto">
                <TabsTrigger value="all" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Tất cả</span>
                  <span className="hidden sm:block">Tất cả ({tasks.length})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Đang làm</span>
                  <span className="hidden sm:block">Đang làm ({inProgressCount})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Hoàn thành</span>
                  <span className="hidden sm:block">Hoàn thành ({completedCount})</span>
                </TabsTrigger>
                <TabsTrigger value="high" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Cao</span>
                  <span className="hidden sm:block">Cao ({highPriorityCount})</span>
                </TabsTrigger>
                <TabsTrigger value="overdue" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Quá hạn</span>
                  <span className="hidden sm:block">Quá hạn ({overdueCount})</span>
                </TabsTrigger>
                <TabsTrigger value="due-soon" className="px-1 sm:px-2 py-2 text-xs leading-tight">
                  <span className="block sm:hidden">Sắp hết</span>
                  <span className="hidden sm:block">Sắp hết hạn ({dueSoonCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Professional View Selector */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-background/80 to-muted/50 backdrop-blur-sm rounded-2xl p-1 border border-border/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Button
                      variant="default"
                      size="sm"
                      className="relative px-6 py-3 rounded-xl font-medium transition-all duration-300 btn-professional bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    >
                      <List className="h-4 w-4 mr-2" />
                      <span>Danh sách</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">{displayTasks.length} tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Content Area - Grid View */}
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                {displayTasks.map((task, index) => {
                  const isOverdue = () => {
                    if (task.status === "completed") return false
                    
                    const now = new Date()
                    const dueDate = new Date(task.dueDate)
                    
                    if (task.endTime) {
                      const [hours, minutes] = task.endTime.split(':')
                      dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                    } else {
                      dueDate.setHours(23, 59, 59, 999)
                    }
                    
                    return now > dueDate
                  }

                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case "high": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                      case "medium": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                      case "low": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                      default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }
                  }

                  return (
                    <Card 
                      key={task.id}
                      className={cn(
                        "hover:shadow-lg transition-all duration-300 border group cursor-pointer h-fit",
                        "bg-card hover:bg-accent/10 shadow-sm",
                        task.status === "todo" && "border-l-4 border-l-slate-400 dark:border-l-slate-500",
                        task.status === "in-progress" && "border-l-4 border-l-blue-500 dark:border-l-blue-400",
                        task.status === "completed" && "border-l-4 border-l-green-500 dark:border-l-green-400",
                        isOverdue() && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20",
                        "animate-in slide-in-from-bottom-4 duration-500"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => viewTaskDetail(task)}
                    >
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className={cn(
                            "font-medium text-xs sm:text-sm line-clamp-2 flex-1 mr-1 leading-tight",
                            task.status === "todo" && "text-slate-700 dark:text-slate-200",
                            task.status === "in-progress" && "text-blue-700 dark:text-blue-200",
                            task.status === "completed" && "text-green-700 dark:text-green-200 line-through"
                          )}>
                            {task.title}
                          </h3>
                          <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                editTask(task)
                              }}
                              className="h-5 w-5 p-0 sm:h-6 sm:w-6"
                            >
                              <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTask(task.id!)
                              }}
                              className="h-5 w-5 p-0 sm:h-6 sm:w-6 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mb-1.5">
                          <Badge className={cn("text-xs font-medium px-1 py-0.5 sm:px-1.5", getPriorityColor(task.priority))}>
                            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                          </Badge>
                          
                          {isOverdue() && (
                            <Badge variant="destructive" className="text-xs px-1 py-0.5 sm:px-1.5">
                              ⚠️
                            </Badge>
                          )}
                          
                          {task.completionPhoto && (
                            <Badge variant="outline" className="text-xs px-1 py-0.5 sm:px-1.5">
                              📸
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="text-xs">{task.dueDate}</span>
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-1.5">
                            {task.tags.slice(0, 1).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs px-1 py-0.5 sm:px-1.5">
                                {tag.length > 8 ? tag.substring(0, 8) + '...' : tag}
                              </Badge>
                            ))}
                            {task.tags.length > 1 && (
                              <Badge variant="outline" className="text-xs px-1 py-0.5 sm:px-1.5">
                                +{task.tags.length - 1}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-0.5 sm:gap-1 mt-auto">
                          {task.status === "todo" && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTask(task.id!)
                              }}
                              className="flex-1 h-6 sm:h-7 text-xs bg-blue-500 hover:bg-blue-600"
                            >
                              ▶️
                            </Button>
                          )}
                          {task.status === "in-progress" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTask(task.id!, 'todo')
                                }}
                                className="flex-1 h-6 sm:h-7 text-xs"
                              >
                                ⬅️
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTask(task.id!, 'completed')
                                }}
                                className="flex-1 h-6 sm:h-7 text-xs bg-green-500 hover:bg-green-600"
                              >
                                ✅
                              </Button>
                            </>
                          )}
                          {task.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTask(task.id!)
                              }}
                              className="flex-1 h-6 sm:h-7 text-xs"
                            >
                              🔄
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {displayTasks.length === 0 && (
                  <div className="col-span-full">
                    <Card className="border-dashed border-2 border-muted-foreground/25 bg-gradient-to-br from-muted/30 to-muted/10">
                      <CardContent className="p-6 sm:p-12 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 rounded-full flex items-center justify-center">
                          <div className="text-xl sm:text-2xl">📋</div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 text-muted-foreground">
                          {searchTerm ? "Không tìm thấy kết quả" : "Chưa có task nào"}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md mx-auto">
                          {searchTerm
                            ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc để xem thêm kết quả."
                            : "Bắt đầu bằng cách tạo task đầu tiên của bạn!"}
                        </p>
                        {!searchTerm && (
                          <Button 
                            onClick={() => setShowTaskForm(true)} 
                            className="mt-3 sm:mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            size="sm"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Tạo task mới</span>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={showPhotoCapture}
        onClose={() => {
          setShowPhotoCapture(false)
          setTaskToComplete(null)
        }}
        onCapture={handlePhotoCapture}
        taskTitle={taskToComplete?.title || ""}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false)
          setSelectedTask(null)
        }}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={showEditModal || showTaskForm}
        onClose={() => {
          setShowEditModal(false)
          setShowTaskForm(false)
          setEditingTask(null)
        }}
        onAddTask={addTask}
        onUpdateTask={updateTask}
      />
    </div>
  )
}