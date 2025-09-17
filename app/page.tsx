"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Plus, BarChart3, List, Download, Upload, Calendar, ArrowUpDown, Columns3, Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TaskForm } from "@/components/task-form"
import { TaskCard } from "@/components/task-card"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { OnboardingTour } from "@/components/onboarding-tour"
import { SearchFilter } from "@/components/search-filter"
import { KanbanBoard } from "@/components/kanban-board"
import { CalendarView } from "@/components/calendar-view"
import { PhotoCaptureModal } from "@/components/photo-capture-modal"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getTasks, addTask as addTaskToFirestore, updateTask as updateTaskInFirestore, deleteTask as deleteTaskFromFirestore, subscribeToTasks, Task } from "@/services/taskService"



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
  const [currentView, setCurrentView] = useState<"tasks" | "analytics" | "calendar" | "kanban">("tasks")
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

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    let newStatus: "todo" | "in-progress" | "completed"

    // Status workflow: todo -> in-progress -> completed -> todo
    switch (task.status) {
      case "todo":
        newStatus = "in-progress"
        toast.success("🟡 Đã bắt đầu làm việc!")
        break
      case "in-progress":
        // Require photo for completion
        setTaskToComplete(task)
        setShowPhotoCapture(true)
        return
      case "completed":
        newStatus = "todo"
        toast.success("🔄 Đã đặt lại trạng thái")
        break
      default:
        return
    }

    try {
      await updateTaskInFirestore(id, {
        status: newStatus,
        completed: newStatus === "completed",
        completedAt: undefined,
        completionPhoto: undefined
      })
    } catch (error) {
      toast.error("❌ Lỗi khi cập nhật trạng thái!")
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
    setShowTaskForm(true)
  }

  const viewTaskDetail = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const getDisplayTasks = () => {
    const tasksToFilter = searchTerm ? filteredTasks : tasks

    let filtered = tasksToFilter.filter((task) => {
      if (filter === "completed") return task.status === "completed"
      if (filter === "pending") return task.status === "in-progress"
      if (filter === "high") return task.priority === "high"
      if (filter === "overdue") return new Date(task.dueDate) < new Date() && (task.status === "todo" || task.status === "in-progress")
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
    return new Date(task.dueDate) < new Date() && (task.status === "todo" || task.status === "in-progress")
  }).length
  const highPriorityCount = tasks.filter((task) => task.priority === "high").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Work management" className="h-6 w-6 md:h-8 md:w-8 cursor-pointer" onClick={() => window.location.reload()} />
              <h1 className="text-lg md:text-2xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => window.location.reload()}>Work Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs px-2 py-1 h-6 hidden sm:flex ${shortcutsEnabled ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' : 'bg-muted text-muted-foreground'}`}
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

      {/* Navigation Bar */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              <Button
                variant={currentView === "tasks" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("tasks")}
                className="flex-shrink-0"
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Danh sách</span>
              </Button>
              <Button
                variant={currentView === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("kanban")}
                className="flex-shrink-0"
              >
                <Columns3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button
                variant={currentView === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("calendar")}
                className="flex-shrink-0"
              >
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Lịch</span>
              </Button>
              <Button
                variant={currentView === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("analytics")}
                className="flex-shrink-0"
              >
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Thống kê</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportTasks} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Xuất</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="flex-shrink-0">
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
          <AnalyticsDashboard tasks={tasks} />
        ) : currentView === "kanban" ? (
          <>
            {/* Task Form for Kanban */}
            {showTaskForm && (
              <div className="mb-8">
                <TaskForm
                  onAddTask={addTask}
                  onCancel={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                  }}
                  editingTask={editingTask}
                  onUpdateTask={updateTask}
                />
              </div>
            )}
            <KanbanBoard
              tasks={displayTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          </>
        ) : currentView === "calendar" ? (
          <>
            {/* Task Form for Calendar */}
            {showTaskForm && (
              <div className="mb-8">
                <TaskForm
                  onAddTask={addTask}
                  onCancel={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                  }}
                  editingTask={editingTask}
                  onUpdateTask={updateTask}
                />
              </div>
            )}
            <CalendarView tasks={tasks} onEdit={editTask} />
          </>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng công việc</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chưa bắt đầu</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{todoCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
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

            {/* Task Form */}
            {showTaskForm && (
              <div className="mb-8">
                <TaskForm
                  onAddTask={addTask}
                  onCancel={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                  }}
                  editingTask={editingTask}
                  onUpdateTask={updateTask}
                />
              </div>
            )}

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={setFilter} className="mb-4 md:mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-xs sm:text-sm h-auto">
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
              </TabsList>
            </Tabs>

            {/* Tasks List */}
            <div className="space-y-4">
              {displayTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} onViewDetail={viewTaskDetail} />
              ))}

              {displayTasks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Không tìm thấy công việc phù hợp với từ khóa tìm kiếm."
                        : "Không có công việc nào phù hợp với bộ lọc hiện tại."}
                    </p>
                  </CardContent>
                </Card>
              )}
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
    </div>
  )
}