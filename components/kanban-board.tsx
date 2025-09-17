"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2, Calendar } from "lucide-react"
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
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggedTask(task)
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className={cn(
        "mb-4 cursor-move hover:shadow-lg transition-shadow duration-200 border hover:border-primary/30",
        "bg-card hover:bg-accent/10 shadow-sm hover:shadow-md",
        task.status === "todo" && "border-l-4 border-l-slate-400 dark:border-l-slate-500",
        task.status === "in-progress" && "border-l-4 border-l-blue-500 dark:border-l-blue-400",
        task.status === "completed" && "border-l-4 border-l-green-500 dark:border-l-green-400",
        isOverdue(task.dueDate) && task.status !== "completed" && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20",
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
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-primary/10 transition-colors"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              onClick={() => task.id && onDelete(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
          {isOverdue(task.dueDate) && task.status !== "completed" && (
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
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Todo Column */}
      <div
        className="space-y-4"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "todo")}
        data-drop-zone="todo"
      >
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-md transition-colors duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-200 tracking-wide">
              <span className="text-2xl">⏳</span>
              Chưa bắt đầu ({todoTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="min-h-[300px] md:min-h-[400px] p-2 md:p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-300 group" data-drop-zone="todo">
          {todoTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {todoTasks.length === 0 && (
            <div className="text-center text-muted-foreground py-16 text-sm">
              <div className="text-4xl mb-3 opacity-30">⏳</div>
              <p className="font-medium">Không có task nào</p>
            </div>
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div
        className="space-y-4"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "in-progress")}
        data-drop-zone="in-progress"
      >
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-md transition-colors duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-3 text-blue-700 dark:text-blue-300 tracking-wide">
              <span className="text-2xl">⚡</span>
              Đang thực hiện ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="min-h-[300px] md:min-h-[400px] p-2 md:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 transition-colors duration-300 group" data-drop-zone="in-progress">
          {inProgressTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {inProgressTasks.length === 0 && (
            <div className="text-center text-muted-foreground py-16 text-sm">
              <div className="text-4xl mb-3 opacity-30">⚡</div>
              <p className="font-medium">Không có task nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Done Column */}
      <div
        className="space-y-4"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "completed")}
        data-drop-zone="completed"
      >
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 shadow-md transition-colors duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-3 text-green-700 dark:text-green-300 tracking-wide">
              <span className="text-2xl">✅</span>
              Đã hoàn thành ({doneTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="min-h-[300px] md:min-h-[400px] p-2 md:p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 transition-colors duration-300 group" data-drop-zone="completed">
          {doneTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {doneTasks.length === 0 && (
            <div className="text-center text-muted-foreground py-16 text-sm">
              <div className="text-4xl mb-3 opacity-30">✅</div>
              <p className="font-medium">Chưa hoàn thành task nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}