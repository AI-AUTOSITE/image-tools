
// ===================================
// 2. lib/tools/existing-tools.ts - 既存ツールの登録
// ===================================
import { Zap, Maximize2, RefreshCw } from 'lucide-react'
import { toolRegistry } from '@/lib/tool-registry'
import imageCompression from 'browser-image-compression'

// Image Compressor Tool
toolRegistry.register({
  id: 'compress',
  name: 'Image Compressor',
  description: 'Reduce file size without quality loss',
  icon: <Zap className="w-8 h-8" />,
  color: 'bg-blue-500',
  category: 'essential',
  badge: 'Popular',
  available: true,
  
  processImage: async (file: File, options: any) => {
    const compressOptions = {
      maxSizeMB: 10,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      quality: options.quality || 0.8,
    }
    
    const compressedFile = await imageCompression(file, compressOptions)
    const blob = new Blob([compressedFile], { type: compressedFile.type })
    
    return {
      blob,
      url: URL.createObjectURL(blob),
      metadata: {
        originalSize: file.size,
        processedSize: blob.size,
        reduction: Math.round((1 - blob.size / file.size) * 100)
      }
    }
  },
  
  defaultOptions: { quality: 0.8 },
  
  optionsComponent: ({ options, onChange }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Quality: {Math.round(options.quality * 100)}%
      </label>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={options.quality}
        onChange={(e) => onChange({ ...options, quality: parseFloat(e.target.value) })}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  )
})

// Image Resizer Tool
toolRegistry.register({
  id: 'resize',
  name: 'Image Resizer',
  description: 'Change dimensions instantly',
  icon: <Maximize2 className="w-8 h-8" />,
  color: 'bg-purple-500',
  category: 'essential',
  available: true,
  
  processImage: async (file: File, options: any) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = options.width || 1920
        canvas.height = options.height || 1080
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              metadata: {
                originalSize: file.size,
                processedSize: blob.size,
                width: canvas.width,
                height: canvas.height
              }
            })
          }
        }, file.type || 'image/jpeg', 0.95)
      }
      img.src = URL.createObjectURL(file)
    })
  },
  
  defaultOptions: { width: 1920, height: 1080 },
  
  optionsComponent: ({ options, onChange }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Width (px)
        </label>
        <input
          type="number"
          value={options.width}
          onChange={(e) => onChange({ ...options, width: parseInt(e.target.value) || 1920 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          value={options.height}
          onChange={(e) => onChange({ ...options, height: parseInt(e.target.value) || 1080 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          min="1"
          max="10000"
        />
      </div>
    </div>
  )
})

// Format Converter Tool
toolRegistry.register({
  id: 'convert',
  name: 'Format Converter',
  description: 'Convert between image formats',
  icon: <RefreshCw className="w-8 h-8" />,
  color: 'bg-green-500',
  category: 'essential',
  available: true,
  
  processImage: async (file: File, options: any) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const mimeType = `image/${options.format || 'webp'}`
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              metadata: {
                originalSize: file.size,
                processedSize: blob.size,
                format: options.format
              }
            })
          }
        }, mimeType, options.quality || 0.9)
      }
      img.src = URL.createObjectURL(file)
    })
  },
  
  defaultOptions: { format: 'webp', quality: 0.9 },
  
  optionsComponent: ({ options, onChange }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Output Format
        </label>
        <select
          value={options.format}
          onChange={(e) => onChange({ ...options, format: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="bmp">BMP</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Quality: {Math.round((options.quality || 0.9) * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={options.quality || 0.9}
          onChange={(e) => onChange({ ...options, quality: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
      </div>
    </div>
  )
})
