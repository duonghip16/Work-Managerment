"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, X, RotateCcw, Check } from "lucide-react"

interface PhotoCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
  taskTitle: string
}

export function PhotoCaptureModal({ isOpen, onClose, onCapture, taskTitle }: PhotoCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Không thể truy cập camera. Vui lòng cho phép quyền camera.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        context.drawImage(video, 0, 0)
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedPhoto(photoData)
      }
    }
  }, [])

  const retakePhoto = () => {
    setCapturedPhoto(null)
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
      handleClose()
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedPhoto(null)
    onClose()
  }

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !stream && !capturedPhoto) {
      startCamera()
    }
  }, [isOpen, stream, capturedPhoto, startCamera])

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
    }
  }, [isOpen, stopCamera])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Chụp ảnh hoàn thành task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chụp ảnh để xác nhận hoàn thành: <strong>{taskTitle}</strong>
          </p>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {!capturedPhoto ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white">Đang khởi động camera...</div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2">
            {!capturedPhoto ? (
              <>
                <Button onClick={capturePhoto} disabled={!stream || isLoading} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Chụp ảnh
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button onClick={confirmPhoto} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Xác nhận
                </Button>
                <Button variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Chụp lại
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}