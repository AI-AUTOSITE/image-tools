'use client'

import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Download, Upload, Image as ImageIcon, CheckCircle, X, FileImage, Settings } from 'lucide-react'

interface CompressedImage {
  id: string
  original: File
  compressed: File | null
  originalSize: number
  compressedSize: number
  reduction: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
  preview?: string
  error?: string
}

export default function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [quality, setQuality] = useState(0.8)
  const [showSettings, setShowSettings] = useState(false)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const compressImage = async (file: File, id: string): Promise<void> => {
    try {
      // Update status to compressing
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'compressing' as const } : img
      ))

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        quality: quality,
        fileType: file.type as string,
      }

      const compressedFile = await imageCompression(file, options)
      
      const compressedWithName = new File([compressedFile], file.name, {
        type: compressedFile.type,
      })

      // Update with compressed result
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          compressed: compressedWithName,
          compressedSize: compressedFile.size,
          reduction: Math.round((1 - compressedFile.size / file.size) * 100),
          status: 'completed' as const,
        } : img
      ))
    } catch (error) {
      // Update with error
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          status: 'error' as const,
          error: 'Compression failed. Please try again.'
        } : img
      ))
      console.error('Compression failed:', error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Premium check
    if (!isPremium && images.length + acceptedFiles.length > 5) {
      setShowUpgradeModal(true)
      return
    }
    
    // Add files to state with pending status
    const newImages: CompressedImage[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      original: file,
      compressed: null,
      originalSize: file.size,
      compressedSize: 0,
      reduction: 0,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    setIsProcessing(true)

    // Process each image
    for (const img of newImages) {
      await compressImage(img.original, img.id)
    }

    setIsProcessing(false)
  }, [quality, maxWidth, images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    multiple: true,
  })

  const downloadSingle = (img: CompressedImage) => {
    if (!img.compressed) return
    const url = URL.createObjectURL(img.compressed)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed-${img.original.name}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.compressed)
    completedImages.forEach(img => downloadSingle(img))
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.preview) {
        URL.revokeObjectURL(img.preview)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
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
  const totalReduction = images.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0)

  // ここからreturn文 - Fragment(<>...</>)で全体をラップして、最後にUpgradeModalを追加
  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full mb-4"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Compression Settings</span>
            </div>
            <span className="text-sm text-gray-500">
              Quality: {Math.round(quality * 100)}% • Max Width: {maxWidth}px
            </span>
          </button>
          
          {showSettings && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quality
                  </label>
                  <span className="text-sm font-semibold text-blue-600">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Smaller Size</span>
                  <span>Better Quality</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Max Width/Height
                  </label>
                  <span className="text-sm font-semibold text-blue-600">
                    {maxWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="4096"
                  step="100"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>800px</span>
                  <span>4096px</span>
                </div>
              </div>
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
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium text-blue-600">
              Drop your images here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop images here
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WebP, GIF, BMP supported • {!isPremium && `${5 - images.length} free slots remaining • `}No file size limits
              </p>
              {!isPremium && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  Free users: 5 images limit • Upgrade for unlimited
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
                {completedCount}/{images.length} Images Processed
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {/* Thumbnail */}
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
                      {img.status === 'compressing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {img.original.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(img.originalSize)} 
                        {img.status === 'completed' && (
                          <>
                            {' → '}
                            <span className="text-green-600 font-medium">
                              {formatFileSize(img.compressedSize)}
                            </span>
                          </>
                        )}
                      </p>
                      {img.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1">{img.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-3">
                    {img.status === 'completed' && (
                      <>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            -{img.reduction}%
                          </p>
                          <p className="text-xs text-gray-500">
                            saved
                          </p>
                        </div>
                        <button
                          onClick={() => downloadSingle(img)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {img.status === 'compressing' && (
                      <div className="text-sm text-gray-500">Processing...</div>
                    )}
                    {img.status === 'pending' && (
                      <div className="text-sm text-gray-400">Waiting...</div>
                    )}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            {completedCount > 0 && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(totalReduction)}
                    </p>
                    <p className="text-sm text-gray-600">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {completedCount}
                    </p>
                    <p className="text-sm text-gray-600">Images Compressed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {images.length > 0 ? Math.round(totalReduction / images.reduce((acc, img) => acc + img.originalSize, 0) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Average Reduction</p>
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">All Formats</h3>
              <p className="text-sm text-gray-500">JPG, PNG, WebP, GIF, BMP</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                {isPremium ? 'Unlimited' : '5 Images Free'}
              </h3>
              <p className="text-sm text-gray-500">
                {isPremium ? 'Process unlimited files' : 'Upgrade for unlimited'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Batch Download</h3>
              <p className="text-sm text-gray-500">Download all at once</p>
            </div>
          </div>
        )}
      </div>

      {/* UpgradeModalをここに追加 - divの外側、Fragmentの内側 */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  )
}