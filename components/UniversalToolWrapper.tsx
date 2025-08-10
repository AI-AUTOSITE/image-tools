// ===================================
// 2. components/UniversalToolWrapper.tsx - 汎用ツールラッパー
// ===================================
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Download, Upload, Settings, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import UpgradeModal from '@/components/UpgradeModal'
import { ToolConfig, ProcessedImage } from '@/lib/tool-registry'

interface UniversalToolWrapperProps {
  tool: ToolConfig
}

export default function UniversalToolWrapper({ tool }: UniversalToolWrapperProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [options, setOptions] = useState(tool.defaultOptions || {})
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const { user, isPremium } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const processFiles = async (filesToProcess: File[]) => {
    // Premium check
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
    setIsProcessing(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    await processFiles(acceptedFiles)
  }, [options, files.length, isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    multiple: true,
  })

  const downloadAll = () => {
    processedImages.forEach((img, index) => {
      const a = document.createElement('a')
      a.href = img.url
      a.download = `processed-${files[index]?.name || 'image'}`
      a.click()
    })
  }

  const clearAll = () => {
    processedImages.forEach(img => URL.revokeObjectURL(img.url))
    setFiles([])
    setProcessedImages([])
  }

  const ToolComponent = tool.component

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Tool Settings</span>
            </div>
            <span className="text-sm text-gray-500">
              Click to {showSettings ? 'hide' : 'show'} options
            </span>
          </button>
          
          {showSettings && (
            <div className="mt-4 pt-4 border-t">
              <ToolComponent
                onProcess={processFiles}
                isProcessing={isProcessing}
                results={processedImages}
                options={options}
                onOptionsChange={setOptions}
              />
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
                  Free: 5 images • {5 - files.length} slots remaining
                </p>
              )}
            </>
          )}
        </div>

        {/* Results */}
        {processedImages.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {processedImages.length} Images Processed
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {processedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img.url} 
                    alt={`Processed ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = img.url
                        a.download = `processed-${files[index]?.name || 'image'}`
                        a.click()
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
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
