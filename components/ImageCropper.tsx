// components/ImageCropper.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Crop, Download, Upload, Square, Smartphone, 
  Monitor, Camera, Loader2, Move
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'

interface CroppedImage {
  id: string
  original: File
  cropped: string | null
  originalDimensions: { width: number; height: number }
  croppedDimensions: { width: number; height: number }
  status: 'pending' | 'cropping' | 'completed' | 'error'
  preview?: string
}

interface AspectRatio {
  name: string
  ratio: number
  icon: React.ReactNode
  width?: number
  height?: number
}

const aspectRatios: AspectRatio[] = [
  { name: 'Free', ratio: 0, icon: <Move className="w-4 h-4" /> },
  { name: 'Square', ratio: 1, icon: <Square className="w-4 h-4" />, width: 1, height: 1 },
  { name: '16:9', ratio: 16/9, icon: <Monitor className="w-4 h-4" />, width: 16, height: 9 },
  { name: '4:3', ratio: 4/3, icon: <Camera className="w-4 h-4" />, width: 4, height: 3 },
  { name: '9:16', ratio: 9/16, icon: <Smartphone className="w-4 h-4" />, width: 9, height: 16 },
]

export default function ImageCropper() {
  const [images, setImages] = useState<CroppedImage[]>([])
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0])
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const cropImage = async (file: File, id: string): Promise<void> => {
    try {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'cropping' as const } : img
      ))

      const img = new Image()
      const url = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) throw new Error('Canvas context not available')
      
      // Calculate crop dimensions
      let cropX = (img.width * cropArea.x) / 100
      let cropY = (img.height * cropArea.y) / 100
      let cropWidth = (img.width * cropArea.width) / 100
      let cropHeight = (img.height * cropArea.height) / 100
      
      // Apply aspect ratio if selected
      if (selectedRatio.ratio > 0) {
        if (cropWidth / cropHeight > selectedRatio.ratio) {
          cropWidth = cropHeight * selectedRatio.ratio
        } else {
          cropHeight = cropWidth / selectedRatio.ratio
        }
      }
      
      canvas.width = cropWidth
      canvas.height = cropHeight
      
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )
      
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.95)
      
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          cropped: croppedUrl,
          originalDimensions: { width: img.width, height: img.height },
          croppedDimensions: { width: Math.round(cropWidth), height: Math.round(cropHeight) },
          status: 'completed' as const,
        } : img
      ))
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Crop failed:', error)
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          status: 'error' as const,
        } : img
      ))
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isPremium && images.length + acceptedFiles.length > 5) {
      setShowUpgradeModal(true)
      return
    }

    const newImages: CroppedImage[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      original: file,
      cropped: null,
      originalDimensions: { width: 0, height: 0 },
      croppedDimensions: { width: 0, height: 0 },
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    
    if (newImages.length > 0) {
      setCurrentImage(newImages[0].preview || null)
    }
  }, [images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
  })

  const cropAll = async () => {
    setIsProcessing(true)
    for (const img of images.filter(i => i.status === 'pending')) {
      await cropImage(img.original, img.id)
    }
    setIsProcessing(false)
  }

  const downloadSingle = (img: CroppedImage) => {
    if (!img.cropped) return
    const a = document.createElement('a')
    a.href = img.cropped
    a.download = `cropped-${img.original.name}`
    a.click()
  }

  const downloadAll = () => {
    images.filter(img => img.status === 'completed').forEach(img => downloadSingle(img))
  }

  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview)
    })
    setImages([])
    setCurrentImage(null)
  }

  const completedCount = images.filter(img => img.status === 'completed').length

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Aspect Ratio Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspect Ratio</h3>
          <div className="grid grid-cols-5 gap-3">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.name}
                onClick={() => setSelectedRatio(ratio)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedRatio.name === ratio.name
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="text-gray-600 mb-1">{ratio.icon}</div>
                  <span className="text-sm font-medium text-gray-900">{ratio.name}</span>
                  {ratio.width && (
                    <span className="text-xs text-gray-500">
                      {ratio.width}:{ratio.height}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive 
              ? 'border-orange-500 bg-orange-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Crop className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium text-orange-600">
              Drop your images here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop images to crop
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Select aspect ratio above, then upload images
              </p>
            </>
          )}
        </div>

        {/* Crop Button */}
        {images.length > 0 && images.some(img => img.status === 'pending') && (
          <div className="mt-6 text-center">
            <button
              onClick={cropAll}
              disabled={isProcessing}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Cropping...
                </>
              ) : (
                <>
                  <Crop className="w-5 h-5 inline mr-2" />
                  Crop All Images
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount}/{images.length} Images Cropped
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={downloadAll}
                  disabled={completedCount === 0}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({completedCount})
                </button>
              </div>
            </div>

            {/* Image List */}
            <div className="space-y-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {img.preview && (
                        <img 
                          src={img.preview} 
                          alt={img.original.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {img.status === 'cropping' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {img.original.name}
                      </p>
                      {img.status === 'completed' && (
                        <p className="text-sm text-gray-500">
                          {img.originalDimensions.width} × {img.originalDimensions.height}
                          {' → '}
                          <span className="text-orange-600 font-medium">
                            {img.croppedDimensions.width} × {img.croppedDimensions.height}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {img.status === 'completed' && (
                      <button
                        onClick={() => downloadSingle(img)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {img.status === 'cropping' && (
                      <div className="text-sm text-gray-500">Processing...</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {images.length === 0 && (
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Crop className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Smart Crop</h3>
              <p className="text-sm text-gray-500">Multiple aspect ratios</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Square className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Presets</h3>
              <p className="text-sm text-gray-500">Common sizes ready</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Batch Export</h3>
              <p className="text-sm text-gray-500">Download all at once</p>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  )
}