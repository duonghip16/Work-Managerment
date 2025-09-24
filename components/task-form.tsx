"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, X, Clock, Tag } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  onCancel?: () => void
  editingTask?: Task | null
  onUpdateTask?: (task: Task) => void
}

export function TaskForm({ onAddTask, onCancel, editingTask, onUpdateTask }: TaskFormProps) {
  const [title, setTitle] = useState(editingTask?.title || "")
  const [description, setDescription] = useState(editingTask?.description || "")
  const [priority, setPriority] = useState<"low" | "medium" | "high">(editingTask?.priority || "medium")
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState<Date | null>(
    editingTask?.startTime ? new Date(`1970-01-01T${editingTask.startTime}:00`) : null
  )
  const [endTime, setEndTime] = useState<Date | null>(
    editingTask?.endTime ? new Date(`1970-01-01T${editingTask.endTime}:00`) : null
  )
  const [category, setCategory] = useState(editingTask?.category || "")
  const [tags, setTags] = useState<string[]>(editingTask?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [timeError, setTimeError] = useState("")
  const [notes, setNotes] = useState(editingTask?.notes || "")
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">(editingTask?.recurring || "none")

  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const validateTimes = (start: Date | null, end: Date | null) => {
    if (!start || !end) {
      setTimeError("")
      return true
    }
    
    if (end <= start) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu")
      return false
    }
    
    setTimeError("")
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    if (!validateTimes(startTime, endTime)) {
      return
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      completed: editingTask?.completed || false,
      status: editingTask?.status || "todo" as const,
      priority,
      dueDate,
      startTime: startTime ? startTime.toTimeString().slice(0, 5) : "",
      endTime: endTime ? endTime.toTimeString().slice(0, 5) : "",
      tags,
      category: category.trim(),
      notes: notes.trim(),
      recurring,
    }

    if (editingTask && onUpdateTask) {
      onUpdateTask({ ...editingTask, ...taskData })
    } else {
      onAddTask(taskData)
    }

    // Reset form if not editing
    if (!editingTask) {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setDueDate(new Date().toISOString().split("T")[0])
      setStartTime(null)
      setEndTime(null)
      setTags([])
      setCategory("")
      setNewTag("")
      setNotes("")
      setRecurring("none")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" lang="en-US">
          <div className="space-y-2">
            <Label htmlFor="title">Tên công việc *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên công việc..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết công việc..."
              rows={3}
              className="whitespace-pre-wrap"
              style={{ wordWrap: 'break-word' }}
            />
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Mức độ ưu tiên</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ví dụ: Công việc, Cá nhân..."
              />
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Ngày hoàn thành</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giờ bắt đầu</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <DatePicker
                  selected={startTime}
                  onChange={(date) => {
                    setStartTime(date)
                    if (endTime) validateTimes(date, endTime)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Giờ"
                  dateFormat="h:mm aa"
                  className="w-full pl-10 pr-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                  placeholderText="Chọn giờ bắt đầu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giờ kết thúc</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <DatePicker
                  selected={endTime}
                  onChange={(date) => {
                    setEndTime(date)
                    if (startTime) validateTimes(startTime, date)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Giờ"
                  dateFormat="h:mm aa"
                  className="w-full pl-10 pr-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                  placeholderText="Chọn giờ kết thúc"
                />
              </div>
            </div>
          </div>

          {/* Time Error */}
          {timeError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {timeError}
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (Markdown)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="**Bold**, *italic*, `code`, - list item..."
              rows={3}
              className="font-mono text-sm whitespace-pre-wrap"
              style={{ wordWrap: 'break-word' }}
            />
          </div>

          {/* Recurring Section */}
          <div className="space-y-2">
            <Label htmlFor="recurring">Lặp lại</Label>
            <Select value={recurring} onValueChange={(value: "none" | "daily" | "weekly" | "monthly") => setRecurring(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không lặp lại</SelectItem>
                <SelectItem value="daily">Hàng ngày</SelectItem>
                <SelectItem value="weekly">Hàng tuần</SelectItem>
                <SelectItem value="monthly">Hàng tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Thêm tag mới..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newTag.trim() && !tags.includes(newTag.trim())) {
                      setTags([...tags, newTag.trim()])
                      setNewTag("")
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newTag.trim() && !tags.includes(newTag.trim())) {
                    setTags([...tags, newTag.trim()])
                    setNewTag("")
                  }
                }}
              >
                Thêm
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              {editingTask ? "Cập nhật" : "Thêm công việc"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
