"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Plus, X, Image } from "lucide-react"

// Task interface
interface Task {
  id: number
  title: string
  status: "todo" | "in-progress" | "done"
  createdAt: string
  completedAt?: string
  proofImage?: string
}

// Photo modal component
function PhotoModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: (imageData: string) => void 
}) {
  const [imageData, setImageData] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageData(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = () => {
    if (imageData) {
      onConfirm(imageData)
      setImageData("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Chụp ảnh hoàn thành
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="photo">Chọn hoặc chụp ảnh:</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>
          
          {imageData && (
            <div className="text-center">
              <img 
                src={imageData} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded border mx-auto"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleConfirm} 
              disabled={!imageData}
              className="flex-1"
            >
              Xác nhận
            </Button>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Task card component
function TaskCard({ 
  task, 
  onDragStart 
}: { 
  task: Task
  onDragStart: (task: Task) => void 
}) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card 
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={() => onDragStart(task)}
    >
      <CardContent className="p-3">
        <h4 className="font-medium text-sm mb-2">{task.title}</h4>
        
        <div className="text-xs text-muted-foreground mb-2">
          Tạo: {formatDateTime(task.createdAt)}
        </div>
        
        {/* Show completion info for done tasks */}
        {task.status === "done" && (
          <div className="space-y-2">
            {task.completedAt && (
              <div className="text-xs text-green-600 font-medium">
                Hoàn thành: {formatDateTime(task.completedAt)}
              </div>
            )}
            
            {task.proofImage && (
              <div className="flex items-center gap-2">
                <Image className="h-3 w-3" />
                <img 
                  src={task.proofImage} 
                  alt="Proof" 
                  className="w-12 h-12 object-cover rounded border cursor-pointer"
                  onClick={() => window.open(task.proofImage, '_blank')}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Kanban component
export function SimpleKanban() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('simple-kanban-tasks')
    if (saved) {
      setTasks(JSON.parse(saved))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('simple-kanban-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Add new task
  const addTask = () => {
    if (!newTaskTitle.trim()) return
    
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: "todo",
      createdAt: new Date().toISOString()
    }
    
    setTasks([...tasks, newTask])
    setNewTaskTitle("")
  }

  // Handle drag start
  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault()
    
    if (!draggedTask) return
    
    // If moving to "done", require photo
    if (newStatus === "done" && draggedTask.status !== "done") {
      setTaskToComplete(draggedTask)
      setShowPhotoModal(true)
    } else {
      // Normal status change
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus }
          : task
      ))
    }
    
    setDraggedTask(null)
  }

  // Handle photo confirmation
  const handlePhotoConfirm = (imageData: string) => {
    if (taskToComplete) {
      setTasks(tasks.map(task => 
        task.id === taskToComplete.id 
          ? { 
              ...task, 
              status: "done" as const,
              completedAt: new Date().toISOString(),
              proofImage: imageData
            }
          : task
      ))
      setTaskToComplete(null)
    }
  }

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === "todo")
  const inProgressTasks = tasks.filter(task => task.status === "in-progress")
  const doneTasks = tasks.filter(task => task.status === "done")

  const columns = [
    { title: "To Do", status: "todo" as const, tasks: todoTasks, color: "bg-gray-50" },
    { title: "In Progress", status: "in-progress" as const, tasks: inProgressTasks, color: "bg-blue-50" },
    { title: "Done", status: "done" as const, tasks: doneTasks, color: "bg-green-50" }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Simple Kanban Board</h1>
        
        {/* Add new task */}
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Nhập tên task mới..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <Button onClick={addTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div
            key={column.status}
            className={`${column.color} rounded-lg p-4 min-h-[500px]`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <h2 className="font-semibold mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-sm bg-white px-2 py-1 rounded">
                {column.tasks.length}
              </span>
            </h2>
            
            <div>
              {column.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                />
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Không có task nào
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Photo modal */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false)
          setTaskToComplete(null)
          setDraggedTask(null)
        }}
        onConfirm={handlePhotoConfirm}
      />
    </div>
  )
}