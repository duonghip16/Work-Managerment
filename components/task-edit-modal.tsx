"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"
import { Task } from "@/services/taskService"

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onAddTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onUpdateTask: (task: Task) => Promise<void>
}

export function TaskEditModal({ task, isOpen, onClose, onAddTask, onUpdateTask }: TaskEditModalProps) {
  const handleCancel = () => {
    onClose()
  }

  const handleAddTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    await onAddTask(taskData)
    onClose()
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    await onUpdateTask(updatedTask)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[98vw] max-h-[98vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle>
            {task ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-8">
          <TaskForm
            onAddTask={handleAddTask}
            onCancel={handleCancel}
            editingTask={task}
            onUpdateTask={handleUpdateTask}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}