"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Tag, Camera, X, Eye, FileText, Repeat } from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"

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

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  if (!task) return null

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
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 border-gray-200"
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="pr-8">{task.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              Ưu tiên {task.priority === "high" ? "cao" : task.priority === "medium" ? "trung bình" : "thấp"}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-medium mb-2">Mô tả:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {task.description}
              </p>
            </div>
          )}

          {/* Date and Time Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày hạn:
              </h4>
              <p className="text-sm">{new Date(task.dueDate).toLocaleDateString('vi-VN')}</p>
            </div>

            {(task.startTime || task.endTime) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Thời gian:
                </h4>
                <p className="text-sm">
                  {task.startTime && task.endTime 
                    ? `${formatTimeToAMPM(task.startTime)} - ${formatTimeToAMPM(task.endTime)}`
                    : formatTimeToAMPM(task.startTime || task.endTime || "")
                  }
                </p>
              </div>
            )}
          </div>

          {/* Category */}
          {task.category && (
            <div>
              <h4 className="font-medium mb-2">Danh mục:</h4>
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {task.category}
              </Badge>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ghi chú:
              </h4>
              <div className="bg-muted p-3 rounded border">
                <MarkdownRenderer content={task.notes} />
              </div>
            </div>
          )}

          {/* Recurring */}
          {task.recurring && task.recurring !== "none" && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Lặp lại:
              </h4>
              <Badge variant="outline" className="text-sm">
                {task.recurring === "daily" ? "Hàng ngày" :
                 task.recurring === "weekly" ? "Hàng tuần" : "Hàng tháng"}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {task.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-green-800 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Thông tin hoàn thành
              </h4>
              
              {task.completedAt && (
                <div className="mb-3">
                  <p className="text-sm text-green-700">
                    <strong>Thời gian hoàn thành:</strong> {new Date(task.completedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              {task.completionPhoto && (
                <div>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Ảnh chứng minh:</strong>
                  </p>
                  <div className="relative">
                    <img 
                      src={task.completionPhoto} 
                      alt="Completion proof" 
                      className="w-full max-w-md h-48 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(task.completionPhoto, '_blank')}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => window.open(task.completionPhoto, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem lớn
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}