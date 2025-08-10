
// ===================================
// 2. components/FormatConverter.tsx - メインコンポーネント
// ===================================
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Download, Upload, RefreshCw, FileImage, CheckCircle, 
  AlertCircle, Loader2, Settings, ArrowRight, Zap
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'

interface ConvertedImage {
  id: string
  original: File
  converted: Blob | null
  originalFormat: string
  targetFormat: string
  originalSize: number
  convertedSize: number
  status: 'pending' | 'converting' | 'completed' | 'error'
  preview?: string
  convertedUrl?: string
  error?: string
}

interface FormatOption {
  value: string
  label: string
  description: string
  badge?: string
}

const formatOptions: FormatOption[] = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos', badge: 'Popular' },
  { value: 'png', label: 'PNG', description: 'Supports transparency' },
  { value: 'webp', label: 'WebP', description: '30% smaller files', badge: 'Recommended' },
  { value: 'avif', label: 'AVIF', description: '50% smaller files', badge: 'Modern' },
  { value: 'gif', label: 'GIF', description: 'Simple animations' },
  { value: 'bmp', label: 'BMP', description: 'Uncompressed' },
]

export default function FormatConverter() {
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [targetFormat, setTargetFormat] = useState<string>('webp')
  const [quality, setQuality] = useState(0.9)
  const [showSettings, setShowSettings] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.')
    return parts[parts.length - 1].toLowerCase()
  }

  const getMimeType = (format: string): string => {
    const mimeTypes: { [key: string]: string } = {
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'avif': 'image/avif',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
    }
    return mimeTypes[format] || 'image/jpeg'
  }

  const convertImage = async (file: File, id: string): Promise<void> => {
    try {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'converting' as const } : img
      ))

      // Create image element
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) throw new Error('Canvas context not available')
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Convert to target format
      const mimeType = getMimeType(targetFormat)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Conversion failed'))
        }, mimeType, quality)
      })
      
      const convertedUrl = URL.createObjectURL(blob)
      
      // Update state
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          converted: blob,
          convertedUrl: convertedUrl,
          convertedSize: blob.size,
          status: 'completed' as const,
        } : img
      ))
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Conversion failed:', error)
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          status: 'error' as const,
          error: 'Failed to convert image'
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
    const newImages: ConvertedImage[] = acceptedFiles.map(file => {
      const originalFormat = getFileExtension(file.name)
      return {
        id: `${Date.now()}-${Math.random()}`,
        original: file,
        converted: null,
        originalFormat: originalFormat,
        targetFormat: targetFormat,
        originalSize: file.size,
        convertedSize: 0,
        status: 'pending' as const,
        preview: URL.createObjectURL(file),
      }
    })

    setImages(prev => [...prev, ...newImages])
    setIsProcessing(true)

    // Process each image
    for (const img of newImages) {
      await convertImage(img.original, img.id)
    }

    setIsProcessing(false)
  }, [targetFormat, quality, images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.svg']
    },
    multiple: true,
  })

  const downloadSingle = (img: ConvertedImage) => {
    if (!img.converted || !img.convertedUrl) return
    const a = document.createElement('a')
    a.href = img.convertedUrl
    const originalName = img.original.name.replace(/\.[^/.]+$/, '')
    a.download = `${originalName}.${targetFormat}`
    a.click()
  }

  const downloadAll = () => {
    images.filter(img => img.status === 'completed').forEach(img => downloadSingle(img))
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.preview) URL.revokeObjectURL(img.preview)
      if (img?.convertedUrl) URL.revokeObjectURL(img.convertedUrl)
      return prev.filter(i => i.id !== id)
    })
  }

  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview)
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl)
    })
    setImages([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const completedCount = images.filter(img => img.status === 'completed').length
  const totalSaved = images.reduce((acc, img) => {
    if (img.status === 'completed') {
      return acc + (img.originalSize - img.convertedSize)
    }
    return acc
  }, 0)

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Format Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Output Format</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setTargetFormat(format.value)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  targetFormat === format.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {format.badge && (
                  <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    {format.badge}
                  </span>
                )}
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{format.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Quality Settings */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Quality
                </label>
                <span className="text-sm font-semibold text-green-600">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Tip: WebP and AVIF provide the best compression with minimal quality loss
              </p>
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive 
              ? 'border-green-500 bg-green-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium text-green-600">
              Drop your images here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop images to convert
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
              <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
                <span>Any format</span>
                <ArrowRight className="w-4 h-4 mx-2" />
                <span className="font-semibold text-green-600">{targetFormat.toUpperCase()}</span>
              </div>
              {!isPremium && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  Free: 5 images • {5 - images.length} slots remaining
                </p>
              )}
            </>
          )}
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount}/{images.length} Images Converted
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
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <FileImage className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                      {img.status === 'converting' && (
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
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="uppercase font-medium">{img.originalFormat}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="uppercase font-medium text-green-600">{img.targetFormat}</span>
                        {img.status === 'completed' && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>
                              {formatFileSize(img.originalSize)} → {formatFileSize(img.convertedSize)}
                            </span>
                            {img.convertedSize < img.originalSize && (
                              <span className="text-green-600 font-medium">
                                (-{Math.round((1 - img.convertedSize / img.originalSize) * 100)}%)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {img.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {img.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {img.status === 'completed' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <button
                          onClick={() => downloadSingle(img)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {img.status === 'converting' && (
                      <div className="text-sm text-gray-500">Converting...</div>
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

            {/* Summary Stats */}
            {completedCount > 0 && totalSaved > 0 && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(Math.abs(totalSaved))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {totalSaved > 0 ? 'Total Saved' : 'Size Change'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {completedCount}
                    </p>
                    <p className="text-sm text-gray-600">Images Converted</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {images.length === 0 && (
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Any Format</h3>
              <p className="text-sm text-gray-500">Convert between 6+ formats</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Modern Formats</h3>
              <p className="text-sm text-gray-500">WebP & AVIF support</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Quality Control</h3>
              <p className="text-sm text-gray-500">Adjust compression level</p>
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