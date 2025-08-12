'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { RotateCw, Download, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'

interface ProcessedImage {
  id: string
  original: File
  processed: string | null
  angle: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  preview?: string
}

export default function ImageRotator() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [rotationAngle, setRotationAngle] = useState(90)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const rotateImage = async (file: File, id: string, angle: number): Promise<void> => {
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
      
      // Calculate new dimensions for rotation
      const rads = (angle * Math.PI) / 180
      const sin = Math.abs(Math.sin(rads))
      const cos = Math.abs(Math.cos(rads))
      
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos
      
      // Rotate around center
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(rads)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      
      const rotatedUrl = canvas.toDataURL('image/jpeg', 0.95)
      
      setImages(prev => prev.map(img => 
        img.id === id ? {
          ...img,
          processed: rotatedUrl,
          angle: angle,
          status: 'completed' as const,
        } : img
      ))
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Rotation failed:', error)
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
      angle: 0,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    setIsProcessing(true)

    for (const img of newImages) {
      await rotateImage(img.original, img.id, rotationAngle)
    }

    setIsProcessing(false)
  }, [rotationAngle, images.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  })

  const downloadSingle = (img: ProcessedImage) => {
    if (!img.processed) return
    const a = document.createElement('a')
    a.href = img.processed
    a.download = `rotated-${img.angle}-${img.original.name}`
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
        {/* Rotation Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotation Angle</h3>
          <div className="grid grid-cols-4 gap-3">
            {[90, 180, 270, -90].map(angle => (
              <button
                key={angle}
                onClick={() => setRotationAngle(angle)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rotationAngle === angle
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <RotateCw className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-sm font-medium">{angle}°</span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Custom Angle: {rotationAngle}°</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
            />
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <RotateCw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop images to rotate
          </p>
          <p className="text-sm text-gray-500">
            Images will be rotated by {rotationAngle}°
          </p>
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount}/{images.length} Images Rotated
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
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
                      <p className="text-sm text-gray-500">Rotated {img.angle}°</p>
                    </div>
                  </div>
                  {img.status === 'completed' && (
                    <button
                      onClick={() => downloadSingle(img)}
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                  {img.status === 'processing' && (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
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