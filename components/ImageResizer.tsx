
// ===================================
// 2. components/ImageResizer.tsx - メインコンポーネント
// ===================================
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Download, Upload, Image as ImageIcon, Maximize2, Lock, Unlock, Smartphone, Monitor, Camera, Square, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'

interface ImageFile {
  id: string
  original: File
  resized: string | null
  originalDimensions: { width: number; height: number }
  newDimensions: { width: number; height: number }
  status: 'pending' | 'processing' | 'completed' | 'error'
  preview?: string
  error?: string
}

interface PresetSize {
  name: string
  width: number
  height: number
  icon: React.ReactNode
  category: string
}

const presetSizes: PresetSize[] = [
  // Social Media
  { name: 'Instagram Post', width: 1080, height: 1080, icon: <Square className="w-4 h-4" />, category: 'Social' },
  { name: 'Instagram Story', width: 1080, height: 1920, icon: <Smartphone className="w-4 h-4" />, category: 'Social' },
  { name: 'Facebook Cover', width: 820, height: 312, icon: <Monitor className="w-4 h-4" />, category: 'Social' },
  { name: 'Twitter Header', width: 1500, height: 500, icon: <Monitor className="w-4 h-4" />, category: 'Social' },
  { name: 'LinkedIn Cover', width: 1584, height: 396, icon: <Monitor className="w-4 h-4" />, category: 'Social' },
  
  // Standard
  { name: 'HD (720p)', width: 1280, height: 720, icon: <Monitor className="w-4 h-4" />, category: 'Standard' },
  { name: 'Full HD (1080p)', width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" />, category: 'Standard' },
  { name: '4K', width: 3840, height: 2160, icon: <Monitor className="w-4 h-4" />, category: 'Standard' },
  { name: 'Thumbnail', width: 150, height: 150, icon: <Square className="w-4 h-4" />, category: 'Standard' },
  { name: 'Profile Photo', width: 400, height: 400, icon: <Camera className="w-4 h-4" />, category: 'Standard' },
]

export default function ImageResizer() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [targetWidth, setTargetWidth] = useState(1920)
  const [targetHeight, setTargetHeight] = useState(1080)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const resizeImage = async (file: File, id: string): Promise<void> => {
    try {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'processing' as const } : img
      ))

      // Create image element
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      const originalWidth = img.width
      const originalHeight = img.height
      
      // Calculate new dimensions
      let newWidth = targetWidth
      let newHeight = targetHeight
      
      if (maintainAspectRatio) {
        const aspectRatio = originalWidth / originalHeight
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio
        } else {
          newHeight = newWidth / aspectRatio
        }
      }

      // Create canvas and resize
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) throw new Error('Canvas context not available')
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, file.type || 'image/jpeg', 0.95)
      })
      
      const resizedUrl = URL.createObjectURL(blob)
      
      // Update state
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          resized: resizedUrl,
          originalDimensions: { width: originalWidth, height: originalHeight },
          newDimensions: { width: Math.round(newWidth), height: Math.round(newHeight) },
          status: 'completed' as const,
        } : img
      ))
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Resize failed:', error)
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          status: 'error' as const,
          error: 'Failed to resize image'
        } : img
      ))
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Premium check
    if (!isPremium && images.length + acceptedFiles.length > 5) {
      setShowUpgradeModal(true)
      return
    }

    // Add files to state
    const newImages: ImageFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      original: file,
      resized: null,
      originalDimensions: { width: 0, height: 0 },
      newDimensions: { width: targetWidth, height: targetHeight },
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    setIsProcessing(true)

    // Process each image
    for (const img of newImages) {
      await resizeImage(img.original, img.id)
    }

    setIsProcessing(false)
  }, [targetWidth, targetHeight, maintainAspectRatio, images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    multiple: true,
  })

  const handlePresetSelect = (preset: PresetSize) => {
    setTargetWidth(preset.width)
    setTargetHeight(preset.height)
    setSelectedPreset(preset.name)
    setMaintainAspectRatio(false)
  }

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (dimension === 'width') {
      setTargetWidth(value)
      if (maintainAspectRatio && images.length > 0) {
        const firstImage = images[0]
        if (firstImage.originalDimensions.width > 0) {
          const ratio = firstImage.originalDimensions.height / firstImage.originalDimensions.width
          setTargetHeight(Math.round(value * ratio))
        }
      }
    } else {
      setTargetHeight(value)
      if (maintainAspectRatio && images.length > 0) {
        const firstImage = images[0]
        if (firstImage.originalDimensions.height > 0) {
          const ratio = firstImage.originalDimensions.width / firstImage.originalDimensions.height
          setTargetWidth(Math.round(value * ratio))
        }
      }
    }
    setSelectedPreset(null)
  }

  const downloadSingle = (img: ImageFile) => {
    if (!img.resized) return
    const a = document.createElement('a')
    a.href = img.resized
    a.download = `resized-${img.newDimensions.width}x${img.newDimensions.height}-${img.original.name}`
    a.click()
  }

  const downloadAll = () => {
    images.filter(img => img.status === 'completed').forEach(img => downloadSingle(img))
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.preview) URL.revokeObjectURL(img.preview)
      if (img?.resized) URL.revokeObjectURL(img.resized)
      return prev.filter(i => i.id !== id)
    })
  }

  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview)
      if (img.resized) URL.revokeObjectURL(img.resized)
    })
    setImages([])
  }

  const completedCount = images.filter(img => img.status === 'completed').length

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resize Settings</h3>
          
          {/* Custom Dimensions */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Width (px)
              </label>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Height (px)
              </label>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
            </div>
          </div>

          {/* Aspect Ratio Lock */}
          <button
            onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              maintainAspectRatio 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {maintainAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {maintainAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
            </span>
          </button>

          {/* Preset Sizes */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preset Sizes</h4>
            <div className="space-y-3">
              {['Social', 'Standard'].map(category => (
                <div key={category}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {presetSizes
                      .filter(preset => preset.category === category)
                      .map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => handlePresetSelect(preset)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedPreset === preset.name
                              ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {preset.icon}
                          <div className="text-left">
                            <div className="font-medium text-xs">{preset.name}</div>
                            <div className="text-xs opacity-75">{preset.width}×{preset.height}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive 
              ? 'border-purple-500 bg-purple-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Maximize2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium text-purple-600">
              Drop your images here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop images to resize
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Will resize to: {targetWidth} × {targetHeight}px
                {!isPremium && ` • ${5 - images.length} free slots remaining`}
              </p>
            </>
          )}
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount}/{images.length} Images Resized
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
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {/* Preview */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {img.preview ? (
                        <img 
                          src={img.preview} 
                          alt={img.original.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                      {img.status === 'processing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {img.original.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {img.originalDimensions.width > 0 && (
                          <>
                            {img.originalDimensions.width} × {img.originalDimensions.height}
                            {' → '}
                            <span className="text-purple-600 font-medium">
                              {img.newDimensions.width} × {img.newDimensions.height}
                            </span>
                          </>
                        )}
                      </p>
                      {img.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1">{img.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {img.status === 'completed' && (
                      <button
                        onClick={() => downloadSingle(img)}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {img.status === 'processing' && (
                      <div className="text-sm text-gray-500">Processing...</div>
                    )}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      ×
                    </button>
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Maximize2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Any Size</h3>
              <p className="text-sm text-gray-500">Custom dimensions up to 10000px</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Smart Ratio</h3>
              <p className="text-sm text-gray-500">Maintain aspect ratio option</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Social Ready</h3>
              <p className="text-sm text-gray-500">Presets for all platforms</p>
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