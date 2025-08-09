
// ===================================
// components/ImageCompressor.tsx
// ===================================
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Download, Upload, Image, CheckCircle } from 'lucide-react'

interface CompressedImage {
  original: File
  compressed: File
  originalSize: number
  compressedSize: number
  reduction: number
}

export default function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [quality, setQuality] = useState(0.8)

  const compressImage = async (file: File): Promise<CompressedImage> => {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      quality: quality,
    }

    const compressedFile = await imageCompression(file, options)
    
    return {
      original: file,
      compressed: new File([compressedFile], file.name, {
        type: compressedFile.type,
      }),
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reduction: Math.round((1 - compressedFile.size / file.size) * 100),
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsCompressing(true)
    
    try {
      const compressed = await Promise.all(
        acceptedFiles.map(file => compressImage(file))
      )
      setImages(prev => [...prev, ...compressed])
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsCompressing(false)
    }
  }, [quality])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
  })

  const downloadAll = () => {
    images.forEach(img => {
      const url = URL.createObjectURL(img.compressed)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed-${img.original.name}`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Quality Slider */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">
            Compression Quality
          </label>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(quality * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Smaller Size</span>
          <span>Better Quality</span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
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
              JPG, PNG, WebP, GIF supported • No file size limits
            </p>
          </>
        )}
      </div>

      {/* Results */}
      {images.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Compressed Images ({images.length})
            </h3>
            <button
              onClick={downloadAll}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Image className="w-10 h-10 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {img.original.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(img.originalSize)} → {formatFileSize(img.compressedSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      -{img.reduction}%
                    </p>
                    <p className="text-xs text-gray-500">
                      size reduction
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(img.compressed)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `compressed-${img.original.name}`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-6 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Total saved: {formatFileSize(
                  images.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}