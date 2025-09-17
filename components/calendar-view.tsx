"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar, Clock, Tag, X } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface CalendarViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
}

export function CalendarView({ tasks, onEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for calendar
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getTasksForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.dueDate === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 dark:bg-red-400"
      case "medium": return "bg-yellow-500 dark:bg-yellow-400"
      case "low": return "bg-green-500 dark:bg-green-400"
      default: return "bg-gray-500 dark:bg-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-100 dark:bg-slate-800 border-l-slate-400 dark:border-l-slate-500"
      case "in-progress": return "bg-blue-50 dark:bg-blue-950/30 border-l-blue-500 dark:border-l-blue-400"
      case "completed": return "bg-green-50 dark:bg-green-950/30 border-l-green-500 dark:border-l-green-400"
      default: return "bg-gray-50 dark:bg-gray-800 border-l-gray-400"
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-900 dark:text-blue-100">
            <Calendar className="h-6 w-6" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={() => setCurrentDate(new Date())} className="bg-blue-600 hover:bg-blue-700">
              Hôm nay
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6">
          {dayNames.map(day => (
            <div key={day} className="p-2 md:p-3 text-center font-semibold text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((date, index) => {
            const dayTasks = getTasksForDate(date)
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] md:min-h-[120px] p-1 md:p-3 border-2 rounded-lg md:rounded-xl transition-all duration-200",
                  date ? "bg-background hover:bg-accent/50 hover:shadow-md cursor-pointer" : "bg-muted/30",
                  isToday(date) && "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-md"
                )}
              >
                {date && (
                  <>
                    <div className={cn(
                      "text-sm md:text-base font-bold mb-1 md:mb-2 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full",
                      isToday(date) ? "bg-blue-600 text-white" : "text-foreground"
                    )}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 1).map(task => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 md:p-2 rounded cursor-pointer hover:shadow-sm transition-all duration-200 border-l-2 md:border-l-3",
                            getStatusColor(task.status)
                          )}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className={cn("w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full", getPriorityColor(task.priority))} />
                            <span className="truncate font-medium text-xs">{task.title}</span>
                          </div>
                          {(task.startTime || task.endTime) && (
                            <div className="text-muted-foreground text-xs font-medium ml-2 md:ml-4 hidden md:block">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {task.startTime && task.endTime 
                                ? `${formatTimeToAMPM(task.startTime)} - ${formatTimeToAMPM(task.endTime)}`
                                : formatTimeToAMPM(task.startTime || task.endTime || "")
                              }
                            </div>
                          )}
                        </div>
                      ))}
                      {dayTasks.slice(1, 2).map(task => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 md:p-2 rounded cursor-pointer hover:shadow-sm transition-all duration-200 border-l-2 md:border-l-3 hidden md:block",
                            getStatusColor(task.status)
                          )}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className={cn("w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full", getPriorityColor(task.priority))} />
                            <span className="truncate font-medium text-xs">{task.title}</span>
                          </div>
                          {(task.startTime || task.endTime) && (
                            <div className="text-muted-foreground text-xs font-medium ml-2 md:ml-4">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {task.startTime && task.endTime 
                                ? `${formatTimeToAMPM(task.startTime)} - ${formatTimeToAMPM(task.endTime)}`
                                : formatTimeToAMPM(task.startTime || task.endTime || "")
                              }
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {dayTasks.length > 1 && (
                        <div className="text-xs text-muted-foreground text-center font-medium bg-muted/50 rounded py-0.5 md:py-1">
                          <span className="md:hidden">+{dayTasks.length - 1}</span>
                          <span className="hidden md:inline">+{dayTasks.length - 2}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTask?.title}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              {selectedTask.description && (
                <div>
                  <h4 className="font-medium mb-1">Mô tả:</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Ngày:</h4>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(selectedTask.dueDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                
                {(selectedTask.startTime || selectedTask.endTime) && (
                  <div>
                    <h4 className="font-medium mb-1">Thời gian:</h4>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {selectedTask.startTime && selectedTask.endTime 
                          ? `${formatTimeToAMPM(selectedTask.startTime)} - ${formatTimeToAMPM(selectedTask.endTime)}`
                          : formatTimeToAMPM(selectedTask.startTime || selectedTask.endTime || "")
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-xs",
                  selectedTask.priority === "high" ? "bg-red-100 text-red-800" :
                  selectedTask.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                )}>
                  {selectedTask.priority === "high" ? "Cao" :
                   selectedTask.priority === "medium" ? "Trung bình" : "Thấp"}
                </Badge>
                
                {selectedTask.status === "completed" && (
                  <Badge variant="secondary">Hoàn thành</Badge>
                )}
              </div>
              
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    onEdit(selectedTask)
                    setSelectedTask(null)
                  }}
                  className="flex-1"
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTask(null)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}