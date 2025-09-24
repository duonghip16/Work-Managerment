"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"


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

interface KanbanBoardProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export function KanbanBoard({ tasks, onToggle, onDelete, onEdit }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragElementRef = useRef<HTMLDivElement | null>(null)

  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const todoTasks = tasks.filter(task => task.status === "todo")
  const inProgressTasks = tasks.filter(task => task.status === "in-progress")
  const doneTasks = tasks.filter(task => task.status === "completed")

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: "todo" | "in-progress" | "completed") => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      // If moving to completed, use toggle to trigger photo capture
      if (newStatus === "completed" && draggedTask.status === "in-progress") {
        draggedTask.id && onToggle(draggedTask.id)
      } else {
        // Direct status change for other transitions
        draggedTask.id && onToggle(draggedTask.id)
      }
    }
    setDraggedTask(null)
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, task: Task) => {
    // Chỉ kích hoạt drag trên desktop, mobile sẽ dùng buttons
    if (window.innerWidth < 768) return
    
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggedTask(task)
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) return
    if (!touchStartPos || !draggedTask) return
    
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)
    
    // Start dragging if moved more than 10px
    if ((deltaX > 10 || deltaY > 10) && !isDragging) {
      setIsDragging(true)
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) return
    if (!isDragging || !draggedTask || !touchStartPos) {
      setDraggedTask(null)
      setTouchStartPos(null)
      setIsDragging(false)
      return
    }

    const touch = e.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    // Find the drop zone
    let dropZone = element
    while (dropZone && !dropZone.getAttribute('data-drop-zone')) {
      dropZone = dropZone.parentElement
    }
    
    if (dropZone) {
      const newStatus = dropZone.getAttribute('data-drop-zone') as "todo" | "in-progress" | "completed"
      if (newStatus && draggedTask.status !== newStatus) {
        if (newStatus === "completed" && draggedTask.status === "in-progress") {
          draggedTask.id && onToggle(draggedTask.id)
        } else {
          draggedTask.id && onToggle(draggedTask.id)
        }
      }
    }
    
    setDraggedTask(null)
    setTouchStartPos(null)
    setIsDragging(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "medium": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "low": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const isOverdue = (task: Task) => {
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

  const TaskCard = ({ task }: { task: Task }) => {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleStatusChange = (newStatus: "todo" | "in-progress" | "completed") => {
      if (task.status !== newStatus && task.id) {
        onToggle(task.id)
      }
      setIsFlipped(false)
    }

    return (
      <div className="relative mb-4 h-auto perspective-1000">
        <div 
          className={cn(
            "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front Side */}
          <Card
            className={cn(
              "absolute inset-0 cursor-move hover:shadow-lg transition-shadow duration-200 border hover:border-primary/30 group task-card backface-hidden",
              "bg-card hover:bg-accent/10 shadow-sm hover:shadow-md",
              task.status === "todo" && "border-l-4 border-l-slate-400 dark:border-l-slate-500",
              task.status === "in-progress" && "border-l-4 border-l-blue-500 dark:border-l-blue-400 status-in-progress",
              task.status === "completed" && "border-l-4 border-l-green-500 dark:border-l-green-400 status-completed",
              task.priority === "high" && "priority-high",
              task.priority === "medium" && "priority-medium",
              task.priority === "low" && "priority-low",
              isOverdue(task) && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20",
              isDragging && draggedTask?.id === task.id && "opacity-50 scale-95"
            )}
            draggable
            onDragStart={() => handleDragStart(task)}
            onTouchStart={(e) => handleTouchStart(e, task)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h4 className={cn(
                  "font-medium text-sm line-clamp-2 flex-1 mr-3 leading-relaxed",
                  task.status === "todo" && "text-slate-700 dark:text-slate-200",
                  task.status === "in-progress" && "text-blue-700 dark:text-blue-200",
                  task.status === "completed" && "text-green-700 dark:text-green-200"
                )}>{task.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFlipped(true)
                  }}
                >
                  <div className="text-xs">⚙️</div>
                </Button>
              </div>
              
              {task.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn("text-xs font-medium px-2.5 py-1", getPriorityColor(task.priority))}>
                  {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </Badge>
                {isOverdue(task) && (
                  <Badge variant="destructive" className="text-xs font-medium px-2.5 py-1">
                    ⚠️ Quá hạn
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{task.dueDate}</span>
                </div>
                {(task.startTime || task.endTime) && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {task.startTime && task.endTime 
                        ? `${formatTimeToAMPM(task.startTime)} - ${formatTimeToAMPM(task.endTime)}`
                        : formatTimeToAMPM(task.startTime || task.endTime || "")
                      }
                    </span>
                  </div>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Mobile Status Change Buttons */}
              <div className="flex gap-1 mt-3 md:hidden">
                {task.status === "todo" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-7 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    onClick={() => task.id && onToggle(task.id)}
                  >
                    Bắt đầu
                  </Button>
                )}
                {task.status === "in-progress" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-7 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                      onClick={() => task.id && onToggle(task.id)}
                    >
                      Quay lại
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-7 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => task.id && onToggle(task.id)}
                    >
                      Hoàn thành
                    </Button>
                  </>
                )}
                {task.status === "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-7 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    onClick={() => task.id && onToggle(task.id)}
                  >
                    Đặt lại
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back Side */}
          <Card className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-dashed border-primary/30 backface-hidden rotate-y-180">
            <CardContent className="p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-sm text-primary truncate">{task.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                    onClick={() => setIsFlipped(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Status Change for In-Progress Tasks */}
                {task.status === "in-progress" && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Chuyển trạng thái:</p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        onClick={() => handleStatusChange("todo")}
                      >
                        ⏳ Quay lại
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => handleStatusChange("completed")}
                      >
                        ✅ Hoàn thành
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Change for Completed Tasks */}
                {task.status === "completed" && (
                  <div className="space-y-2 mb-4">
                    {/* Completion Details */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-3">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">✅ Chi tiết hoàn thành:</p>
                      {task.completedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                          📅 Hoàn thành: {new Date(task.completedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      {task.completionPhoto && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 dark:text-green-400 mb-1">📸 Ảnh chứng minh:</p>
                          <img 
                            src={task.completionPhoto} 
                            alt="Completion proof" 
                            className="w-full h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs font-medium text-muted-foreground mb-2">Chuyển trạng thái:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 w-full"
                      onClick={() => handleStatusChange("todo")}
                    >
                      🔄 Đặt lại
                    </Button>
                  </div>
                )}

                {/* Status Change for Todo Tasks */}
                {task.status === "todo" && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Chuyển trạng thái:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 w-full"
                      onClick={() => handleStatusChange("in-progress")}
                    >
                      ⚡ Bắt đầu làm
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    onEdit(task)
                    setIsFlipped(false)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                  onClick={() => {
                    task.id && onDelete(task.id)
                    setIsFlipped(false)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      slidesPerView={1}
      spaceBetween={16}
      navigation
      pagination={{ clickable: true }}
      className="kanban-swiper"
      breakpoints={{
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
          pagination: false
        }
      }}
    >
      <SwiperSlide>
        <KanbanColumn
          title="⏳ Chưa bắt đầu"
          tasks={todoTasks}
          status="todo"
          bgColor="bg-slate-50 dark:bg-slate-900/50"
          borderColor="border-slate-200 dark:border-slate-700"
          textColor="text-slate-700 dark:text-slate-200"
          dropZoneBg="bg-slate-50/50 dark:bg-slate-900/30"
        />
      </SwiperSlide>
      <SwiperSlide>
        <KanbanColumn
          title="⚡ Đang thực hiện"
          tasks={inProgressTasks}
          status="in-progress"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          borderColor="border-blue-200 dark:border-blue-800"
          textColor="text-blue-700 dark:text-blue-300"
          dropZoneBg="bg-blue-50/50 dark:bg-blue-950/20"
        />
      </SwiperSlide>
      <SwiperSlide>
        <KanbanColumn
          title="✅ Đã hoàn thành"
          tasks={doneTasks}
          status="completed"
          bgColor="bg-green-50 dark:bg-green-950/30"
          borderColor="border-green-200 dark:border-green-800"
          textColor="text-green-700 dark:text-green-300"
          dropZoneBg="bg-green-50/50 dark:bg-green-950/20"
        />
      </SwiperSlide>
    </Swiper>
  )

  // Kanban Column Component
  function KanbanColumn({ title, tasks, status, bgColor, borderColor, textColor, dropZoneBg }: {
    title: string
    tasks: Task[]
    status: "todo" | "in-progress" | "completed"
    bgColor: string
    borderColor: string
    textColor: string
    dropZoneBg: string
  }) {
    return (
      <div
        className="space-y-4 relative"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        data-drop-zone={status}
      >
        <Card className={cn("shadow-md transition-colors duration-300", bgColor, borderColor)}>
          <CardHeader className="pb-4">
            <CardTitle className={cn("text-lg font-semibold flex items-center gap-3 tracking-wide", textColor)}>
              {title} ({tasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className={cn("min-h-[300px] md:min-h-[400px] p-2 md:p-3 rounded-xl transition-colors duration-300 group", dropZoneBg)} data-drop-zone={status}>
          {tasks.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              direction="vertical"
              slidesPerView="auto"
              spaceBetween={16}
              navigation={{
                nextEl: `.task-nav-next-${status}`,
                prevEl: `.task-nav-prev-${status}`
              }}
              className="task-swiper h-full"
              freeMode
              mousewheel
            >
              {tasks.map((task) => (
                <SwiperSlide key={task.id} className="!h-auto">
                  <TaskCard task={task} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center text-muted-foreground py-16 text-sm">
              <div className="text-4xl mb-3 opacity-30">
                {status === "todo" ? "⏳" : status === "in-progress" ? "⚡" : "✅"}
              </div>
              <p className="font-medium">
                {status === "completed" ? "Chưa hoàn thành task nào" : 
                 status === "in-progress" ? "Không có task đang thực hiện" : "Không có task nào"}
              </p>
            </div>
          )}
          
          {/* Navigation Buttons */}
          {tasks.length > 3 && (
            <>
              <button className={`task-nav-prev-${status} absolute top-2 right-12 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity`}>
                ↑
              </button>
              <button className={`task-nav-next-${status} absolute bottom-2 right-12 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity`}>
                ↓
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
}