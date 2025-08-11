
// ===================================
// 3. components/UniversalToolWrapper.tsx - 汎用ツールラッパー
// ===================================
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Download, Upload, Settings, X, Loader2, Grid, List } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'
import { ToolConfig, ProcessedImage } from '@/lib/tool-registry-client'

interface UniversalToolWrapperProps {
  tool: ToolConfig
}

export default function UniversalToolWrapper({ tool }: UniversalToolWrapperProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [options, setOptions] = useState(tool.defaultOptions || {})
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const processFiles = async (filesToProcess: File[]) => {
    if (!isPremium && files.length + filesToProcess.length > 5) {
      setShowUpgradeModal(true)
      return
    }

    setIsProcessing(true)
    const results: ProcessedImage[] = []

    for (const file of filesToProcess) {
      try {
        const result = await tool.processImage(file, options)
        results.push(result)
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
      }
    }

    setProcessedImages(prev => [...prev, ...results])
    setFiles(prev => [...prev, ...filesToProcess])
    setIsProcessing(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await processFiles(acceptedFiles)
  }, [options, files.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    multiple: true,
    disabled: isProcessing
  })

  const downloadSingle = (img: ProcessedImage, index: number) => {
    const a = document.createElement('a')
    a.href = img.url
    const originalName = files[index]?.name || 'image'
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const format = img.metadata?.format || 'jpg'
    a.download = `${tool.id}-${nameWithoutExt}.${format}`
    a.click()
  }

  const downloadAll = () => {
    processedImages.forEach((img, index) => downloadSingle(img, index))
  }

  const clearAll = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url))
    setFiles([])
    setProcessedImages([])
  }

  const removeImage = (index: number) => {
    const img = processedImages[index]
    if (img) URL.revokeObjectURL(img.url)
    setProcessedImages(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const OptionsComponent = tool.optionsComponent

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        {/* Settings Panel */}
        {OptionsComponent && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Settings</span>
              </div>
              <span className="text-sm text-gray-500">
                {showSettings ? 'Hide' : 'Show'} options
              </span>
            </button>
            
            {showSettings && (
              <div className="pt-4 border-t">
                <OptionsComponent options={options} onChange={setOptions} />
              </div>
            )}
          </div>
        )}

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
          <input {...getInputProps()} />
          <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mx-auto mb-4`}>
            {tool.icon}
          </div>
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
              {!isPremium && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  Free: 5 images • {Math.max(0, 5 - files.length)} slots remaining
                </p>
              )}
            </>
          )}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-700">Processing images...</span>
          </div>
        )}

        {/* Results */}
        {processedImages.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {processedImages.length} Images Processed
              </h3>
              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={downloadAll}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
              </div>
            </div>

            {/* Image Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img.url} 
                      alt={`Processed ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center space-x-2">
                      <button
                        onClick={() => downloadSingle(img, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg"
                      >
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                    {img.metadata && (
                      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs">
                        {img.metadata.reduction && (
                          <span className="text-green-600 font-semibold">
                            -{img.metadata.reduction}%
                          </span>
                        )}
                        {img.metadata.width && img.metadata.height && (
                          <span className="text-gray-600 ml-2">
                            {img.metadata.width}×{img.metadata.height}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {processedImages.map((img, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={img.url} 
                        alt={`Processed ${index + 1}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {files[index]?.name || `Image ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {img.metadata?.processedSize && 
                            `${(img.metadata.processedSize / 1024).toFixed(1)} KB`}
                          {img.metadata?.reduction && 
                            <span className="text-green-600 ml-2">(-{img.metadata.reduction}%)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadSingle(img, index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
