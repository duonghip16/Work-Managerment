"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Edit, Trash2, Calendar, Eye } from "lucide-react"
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

interface KanbanBoardVerticalProps {
  tasks: Task[]
  onToggle: (id: string, newStatus?: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onViewDetail?: (task: Task) => void
}

export function KanbanBoardVertical({ tasks, onToggle, onDelete, onEdit, onViewDetail }: KanbanBoardVerticalProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null })
  const [taskDetail, setTaskDetail] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null })
  
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
    
    if (task.endTime) {
      const [hours, minutes] = task.endTime.split(':')
      dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    } else {
      dueDate.setHours(23, 59, 59, 999)
    }
    
    return now > dueDate
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
      e.preventDefault()
      e.stopPropagation()
      action()
    }

    return (
      <Card 
        className={cn(
          "hover:shadow-md transition-all duration-300 border group task-card cursor-pointer",
          "bg-card hover:bg-accent/10 shadow-sm",
          task.status === "todo" && "border-l-4 border-l-slate-400 dark:border-l-slate-500",
          task.status === "in-progress" && "border-l-4 border-l-blue-500 dark:border-l-blue-400",
          task.status === "completed" && "border-l-4 border-l-green-500 dark:border-l-green-400",
          isOverdue(task) && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20"
        )}
        onClick={() => setTaskDetail({ open: true, task })}
      >
        <CardContent className="p-2 sm:p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className={cn(
              "font-semibold text-xs sm:text-sm line-clamp-2 flex-1 mr-1 leading-tight",
              task.status === "todo" && "text-slate-700 dark:text-slate-200",
              task.status === "in-progress" && "text-blue-700 dark:text-blue-200",
              task.status === "completed" && "text-green-700 dark:text-green-200"
            )}>{task.title}</h4>
            <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="h-6 w-6 p-0 rounded hover:bg-primary/10 transition-colors flex items-center justify-center touch-manipulation"
                onClick={(e) => handleButtonClick(e, () => onEdit(task))}
                type="button"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                className="h-6 w-6 p-0 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center justify-center touch-manipulation"
                onClick={(e) => handleButtonClick(e, () => setDeleteConfirm({ open: true, task }))}
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* Mobile: Hide description, Desktop: Show */}
          {task.description && (
            <p className="hidden sm:block text-xs text-muted-foreground mb-2 leading-relaxed whitespace-pre-wrap line-clamp-2" style={{ wordWrap: 'break-word' }}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1 mb-2">
            <Badge className={cn("text-xs font-medium px-1 py-0.5", getPriorityColor(task.priority))}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
            </Badge>
            {isOverdue(task) && (
              <Badge variant="destructive" className="text-xs font-medium px-1 py-0.5">
                ⚠️
              </Badge>
            )}
            {task.completionPhoto && (
              <Badge variant="outline" className="text-xs px-1 py-0.5">
                📸
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            <span className="font-medium text-xs">{task.dueDate}</span>
          </div>
          
          {/* Status Change Buttons - Compact Mobile */}
          <div className="flex gap-1 mt-auto">
            {task.status === "todo" && (
              <button
                className="flex-1 text-xs h-7 px-2 rounded border bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 transition-colors font-medium touch-manipulation"
                onClick={(e) => handleButtonClick(e, () => task.id && onToggle(task.id))}
                type="button"
              >
                ▶️
              </button>
            )}
            {task.status === "in-progress" && (
              <>
                <button
                  className="flex-1 text-xs h-7 px-1 rounded border bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 transition-colors font-medium touch-manipulation"
                  onClick={(e) => handleButtonClick(e, () => task.id && onToggle(task.id, 'todo'))}
                  type="button"
                >
                  ⬅️
                </button>
                <button
                  className="flex-1 text-xs h-7 px-1 rounded border bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 border-green-200 dark:bg-green-950/30 dark:hover:bg-green-900/40 dark:text-green-300 dark:border-green-800 transition-colors font-medium touch-manipulation"
                  onClick={(e) => handleButtonClick(e, () => task.id && onToggle(task.id, 'completed'))}
                  type="button"
                >
                  ✅
                </button>
              </>
            )}
            {task.status === "completed" && (
              <>
                <button
                  className="flex-1 text-xs h-7 px-1 rounded border bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 transition-colors font-medium touch-manipulation"
                  onClick={(e) => handleButtonClick(e, () => task.id && onToggle(task.id))}
                  type="button"
                >
                  🔄
                </button>
                <button
                  className="px-2 text-xs h-7 rounded border bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 transition-colors font-medium touch-manipulation"
                  onClick={(e) => handleButtonClick(e, () => setTaskDetail({ open: true, task }))}
                  type="button"
                >
                  👁️
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Todo Section */}
      <div className="kanban-section space-y-2">
        <Card className="shadow-sm transition-colors duration-300 bg-slate-50/70 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/40">
          <CardHeader className="pb-2 px-3">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 tracking-wide text-slate-700 dark:text-slate-200">
              ⏳ Chưa bắt đầu ({todoTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 p-2 min-h-[180px] w-max min-w-full">
            {todoTasks.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">Không có task nào</p>
                </div>
              </div>
            ) : (
              todoTasks.map((task) => (
                <div key={task.id} className="w-64 flex-shrink-0">
                  <TaskCard task={task} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* In Progress Section */}
      <div className="kanban-section space-y-2">
        <Card className="shadow-sm transition-colors duration-300 bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40">
          <CardHeader className="pb-2 px-3">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 tracking-wide text-blue-700 dark:text-blue-200">
              ⚡ Đang thực hiện ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 p-2 min-h-[180px] w-max min-w-full">
            {inProgressTasks.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-sm">Không có task nào đang thực hiện</p>
                </div>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div key={task.id} className="w-64 flex-shrink-0">
                  <TaskCard task={task} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completed Section */}
      <div className="kanban-section space-y-2">
        <Card className="shadow-sm transition-colors duration-300 bg-green-50/70 dark:bg-green-950/20 border-green-200/60 dark:border-green-800/40">
          <CardHeader className="pb-2 px-3">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 tracking-wide text-green-700 dark:text-green-200">
              ✅ Đã hoàn thành ({doneTasks.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 p-2 min-h-[180px] w-max min-w-full">
            {doneTasks.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm">Chưa hoàn thành task nào</p>
                </div>
              </div>
            ) : (
              doneTasks.map((task) => (
                <div key={task.id} className="w-64 flex-shrink-0">
                  <TaskCard task={task} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={taskDetail.open} onOpenChange={(open) => setTaskDetail({ open, task: null })}>
        <DialogContent className="max-w-md mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {taskDetail.task?.title}
            </DialogTitle>
          </DialogHeader>
          
          {taskDetail.task && (
            <div className="space-y-4">
              {/* Status & Priority */}
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs font-medium px-2 py-1", getPriorityColor(taskDetail.task.priority))}>
                  {taskDetail.task.priority === 'high' ? '🔴 High' : taskDetail.task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {taskDetail.task.status === 'todo' ? '⏳ Chưa bắt đầu' : 
                   taskDetail.task.status === 'in-progress' ? '⚡ Đang thực hiện' : '✅ Đã hoàn thành'}
                </Badge>
                {isOverdue(taskDetail.task) && (
                  <Badge variant="destructive" className="text-xs px-2 py-1">
                    ⚠️ Quá hạn
                  </Badge>
                )}
              </div>

              {/* Description */}
              {taskDetail.task.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Mô tả:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {taskDetail.task.description}
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Ngày hết hạn:</span>
                  <span>{taskDetail.task.dueDate}</span>
                </div>
                {(taskDetail.task.startTime || taskDetail.task.endTime) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Thời gian:</span>
                    <span>
                      {taskDetail.task.startTime && taskDetail.task.endTime 
                        ? `${formatTimeToAMPM(taskDetail.task.startTime)} - ${formatTimeToAMPM(taskDetail.task.endTime)}`
                        : formatTimeToAMPM(taskDetail.task.startTime || taskDetail.task.endTime || "")
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {taskDetail.task.tags && taskDetail.task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {taskDetail.task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              {taskDetail.task.category && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Danh mục:</span>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {taskDetail.task.category}
                  </Badge>
                </div>
              )}

              {/* Completion Photo */}
              {taskDetail.task.completionPhoto && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Ảnh hoàn thành:</h4>
                  <img 
                    src={taskDetail.task.completionPhoto} 
                    alt="Completion proof" 
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}

              {/* Notes */}
              {taskDetail.task.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Ghi chú:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {taskDetail.task.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onEdit(taskDetail.task!)
                    setTaskDetail({ open: false, task: null })
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    setDeleteConfirm({ open: true, task: taskDetail.task })
                    setTaskDetail({ open: false, task: null })
                  }}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, task: null })}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Xác nhận xóa task</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Bạn có chắc chắn muốn xóa task <strong>"{deleteConfirm.task?.title}"</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteConfirm.task?.id) {
                  onDelete(deleteConfirm.task.id)
                }
                setDeleteConfirm({ open: false, task: null })
              }}
            >
              Xóa task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}