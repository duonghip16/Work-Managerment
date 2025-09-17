"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

interface OnboardingTourProps {
  onComplete: () => void
}

const tourSteps = [
  {
    title: "Chào mừng đến với TaskFlow!",
    description: "Ứng dụng quản lý công việc chuyên nghiệp giúp bạn tổ chức và theo dõi tiến độ công việc hiệu quả.",
    highlight: "welcome",
  },
  {
    title: "Dashboard Thống kê",
    description: "Xem tổng quan về tất cả công việc, tỷ lệ hoàn thành và các chỉ số quan trọng.",
    highlight: "stats",
  },
  {
    title: "Tạo Công việc Mới",
    description: "Thêm công việc với mức độ ưu tiên, hạn hoàn thành và danh mục để quản lý tốt hơn.",
    highlight: "add-task",
  },
  {
    title: "Lọc và Sắp xếp",
    description: "Sử dụng các bộ lọc để xem công việc theo trạng thái, mức độ ưu tiên hoặc hạn hoàn thành.",
    highlight: "filters",
  },
  {
    title: "Analytics Chi tiết",
    description: "Phân tích hiệu suất làm việc với biểu đồ và thống kê chi tiết.",
    highlight: "analytics",
  },
]

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isVisible) return null

  const currentTourStep = tourSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentStep + 1}/{tourSteps.length}
            </Badge>
            <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base">{currentTourStep.description}</CardDescription>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>

            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hoàn thành
                </>
              ) : (
                <>
                  Tiếp theo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
