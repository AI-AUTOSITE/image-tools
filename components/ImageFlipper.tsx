'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FlipHorizontal, FlipVertical, Download, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'

type FlipDirection = 'horizontal' | 'vertical' | 'both'

interface ProcessedImage {
  id: string
  original: File
  processed: string | null
  direction: FlipDirection
  status: 'pending' | 'processing' | 'completed' | 'error'
  preview?: string
}

export default function ImageFlipper() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [flipDirection, setFlipDirection] = useState<FlipDirection>('horizontal')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const flipImage = async (file: File, id: string, direction: FlipDirection): Promise<void> => {
    try {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'processing' as const } : img
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
      
      canvas.width = img.width
      canvas.height = img.height
      
      // Apply flip transformation
      if (direction === 'horizontal' || direction === 'both') {
        ctx.scale(-1, 1)
        ctx.drawImage(img, -img.width, 0)
      }
      
      if (direction === 'vertical') {
        ctx.scale(1, -1)
        ctx.drawImage(img, 0, -img.height)
      }
      
      if (direction === 'both') {
        // Already did horizontal, now do vertical
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          tempCtx.scale(1, -1)
          tempCtx.drawImage(canvas, 0, -canvas.height)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tempCanvas, 0, 0)
        }
      }
      
      const flippedUrl = canvas.toDataURL('image/jpeg', 0.95)
      
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          processed: flippedUrl,
          direction: direction,
          status: 'completed' as const,
        } : img
      ))
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Flip failed:', error)
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'error' as const } : img
      ))
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isPremium && images.length + acceptedFiles.length > 5) {
      setShowUpgradeModal(true)
      return
    }

    const newImages: ProcessedImage[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      original: file,
      processed: null,
      direction: flipDirection,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    setIsProcessing(true)

    for (const img of newImages) {
      await flipImage(img.original, img.id, flipDirection)
    }

    setIsProcessing(false)
  }, [flipDirection, images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  })

  const downloadSingle = (img: ProcessedImage) => {
    if (!img.processed) return
    const a = document.createElement('a')
    a.href = img.processed
    a.download = `flipped-${img.direction}-${img.original.name}`
    a.click()
  }

  const downloadAll = () => {
    images.filter(img => img.status === 'completed').forEach(downloadSingle)
  }

  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview)
    })
    setImages([])
  }

  const completedCount = images.filter(img => img.status === 'completed').length

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Flip Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flip Direction</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFlipDirection('horizontal')}
              className={`p-4 rounded-lg border-2 transition-all ${
                flipDirection === 'horizontal'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <FlipHorizontal className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium">Horizontal</span>
            </button>
            <button
              onClick={() => setFlipDirection('vertical')}
              className={`p-4 rounded-lg border-2 transition-all ${
                flipDirection === 'vertical'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <FlipVertical className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium">Vertical</span>
            </button>
            <button
              onClick={() => setFlipDirection('both')}
              className={`p-4 rounded-lg border-2 transition-all ${
                flipDirection === 'both'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex justify-center mb-2">
                <FlipHorizontal className="w-6 h-6 text-gray-600" />
                <FlipVertical className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium">Both</span>
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <FlipHorizontal className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop images to flip
          </p>
          <p className="text-sm text-gray-500">
            Images will be flipped {flipDirection}
          </p>
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount}/{images.length} Images Flipped
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear All
                </button>
                <button
                  onClick={downloadAll}
                  disabled={completedCount === 0}
                  className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {images.map(img => (
                <div key={img.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium text-gray-900">{img.original.name}</p>
                      <p className="text-sm text-gray-500">Flipped {img.direction}</p>
                    </div>
                  </div>
                  {img.status === 'completed' && (
                    <button
                      onClick={() => downloadSingle(img)}
                      className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                  {img.status === 'processing' && (
                    <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}