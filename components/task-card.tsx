"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit, Trash2, Calendar, Tag, Clock, Camera, Eye, Info, Repeat, FileText } from "lucide-react"

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
  notes?: string
  recurring?: "none" | "daily" | "weekly" | "monthly"
  lastRecurringDate?: string
}

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onViewDetail?: (task: Task) => void
}

export function TaskCard({ task, onToggle, onDelete, onEdit, onViewDetail }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao"
      case "medium":
        return "Trung bình"
      case "low":
        return "Thấp"
      default:
        return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
      case "in-progress": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "completed": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo": return "Chưa bắt đầu"
      case "in-progress": return "Đang làm"
      case "completed": return "Hoàn thành"
      default: return status
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"
  const isDueSoon = new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && task.status !== "completed"

  return (
    <Card
      className={`transition-shadow duration-200 hover:shadow-lg shadow-sm border-l-4 ${
        task.status === "todo" ? "border-l-slate-400 dark:border-l-slate-500" :
        task.status === "in-progress" ? "border-l-blue-500 dark:border-l-blue-400" :
        "border-l-green-500 dark:border-l-green-400"
      } ${task.status === "completed" ? "opacity-80" : ""} ${
        isOverdue ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => task.id && onToggle(task.id)}
              className={`mt-0.5 p-1 h-auto ${
                task.status === "completed" ? "text-green-600" :
                task.status === "in-progress" ? "text-blue-600" :
                "text-muted-foreground hover:text-blue-600"
              }`}
            >
              <CheckCircle className={`h-5 w-5 ${task.status === "completed" ? "fill-current" : ""}`} />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3
                  className={`font-semibold text-base cursor-pointer flex-1 leading-relaxed ${
                    task.status === "completed" ? "line-through text-muted-foreground" : 
                    task.status === "todo" ? "text-slate-700 dark:text-slate-200" :
                    task.status === "in-progress" ? "text-blue-700 dark:text-blue-200" :
                    "text-green-700 dark:text-green-200"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {task.title}
                </h3>
                {task.category && (
                  <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium">
                    <Tag className="h-3 w-3 mr-1" />
                    {task.category}
                  </Badge>
                )}
              </div>

              {(isExpanded || task.description) && task.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span
                    className={`font-medium ${
                      isOverdue ? "text-red-600 dark:text-red-400" : 
                      isDueSoon ? "text-orange-600 dark:text-orange-400" : ""
                    }`}
                  >
                    {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {(task.startTime || task.endTime) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {task.startTime && task.endTime 
                        ? `${formatTimeToAMPM(task.startTime)} - ${formatTimeToAMPM(task.endTime)}`
                        : formatTimeToAMPM(task.startTime || task.endTime || "")
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={`text-xs px-2.5 py-1 font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'todo' ? '⏳ Chưa bắt đầu' : 
                   task.status === 'in-progress' ? '⚡ Đang làm' : '✅ Hoàn thành'}
                </Badge>
                <Badge className={`text-xs px-2.5 py-1 font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? '🔴 Cao' : 
                   task.priority === 'medium' ? '🟡 Trung bình' : '🟢 Thấp'}
                </Badge>
                {isOverdue && <Badge variant="destructive" className="text-xs px-2.5 py-1 font-medium">⚠️ Quá hạn</Badge>}
                {isDueSoon && !isOverdue && <Badge variant="outline" className="text-xs px-2.5 py-1 font-medium text-orange-600 dark:text-orange-400">⏰ Sắp hết hạn</Badge>}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Notes Preview */}
              {task.notes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <FileText className="h-3 w-3" />
                  <span className="truncate">{task.notes.substring(0, 50)}{task.notes.length > 50 ? '...' : ''}</span>
                </div>
              )}

              {/* Recurring Info */}
              {task.recurring && task.recurring !== "none" && (
                <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                  <Repeat className="h-3 w-3" />
                  <span>
                    {task.recurring === "daily" ? "Hàng ngày" :
                     task.recurring === "weekly" ? "Hàng tuần" : "Hàng tháng"}
                  </span>
                </div>
              )}

              {/* Completion Info */}
              {task.status === "completed" && task.completedAt && (
                <div className="flex items-center gap-3 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg mt-3">
                  <Camera className="h-4 w-4" />
                  <span className="font-medium">Hoàn thành lúc: {new Date(task.completedAt).toLocaleString('vi-VN')}</span>
                  {task.completionPhoto && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() => window.open(task.completionPhoto, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {task.status === "completed" && onViewDetail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(task)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                title="Xem chi tiết"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => task.id && onDelete(task.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
