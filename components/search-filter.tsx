"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"

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

interface SearchFilterProps {
  tasks: Task[]
  onFilteredTasks: (tasks: Task[]) => void
  onSearchChange: (search: string) => void
}

export function SearchFilter({ tasks, onFilteredTasks, onSearchChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Get unique categories
  const categories = Array.from(new Set(tasks.map((task) => task.category).filter(Boolean)))

  const applyFilters = () => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter

      return matchesSearch && matchesPriority && matchesCategory
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "completed":
          comparison = Number(a.completed) - Number(b.completed)
          break
      }

      return sortOrder === "desc" ? -comparison : comparison
    })

    onFilteredTasks(filtered)
    onSearchChange(searchTerm)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSortBy("dueDate")
    setSortOrder("asc")
    setPriorityFilter("all")
    setCategoryFilter("all")
    onFilteredTasks(tasks)
    onSearchChange("")
  }

  const hasActiveFilters =
    searchTerm || priorityFilter !== "all" || categoryFilter !== "all" || sortBy !== "dueDate" || sortOrder !== "asc"

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">Tìm kiếm và lọc</h3>
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-auto">
            Đang lọc
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Mức độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Hạn hoàn thành</SelectItem>
              <SelectItem value="priority">Mức độ ưu tiên</SelectItem>
              <SelectItem value="title">Tên công việc</SelectItem>
              <SelectItem value="completed">Trạng thái</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} size="sm">
          Áp dụng bộ lọc
        </Button>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
