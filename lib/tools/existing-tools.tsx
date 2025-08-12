// lib/tools/existing-tools.tsx
import React from 'react'
import { Zap, Maximize2, RefreshCw, Crop, RotateCw, Droplets, Palette, Type, Grid3x3, FlipHorizontal, Circle, Layers, Eraser, Wand2, Sun, Moon, Filter, Camera, Scissors, Shield, Eye } from 'lucide-react'
import ImageCompressor from '@/components/ImageCompressor'
import ImageResizer from '@/components/ImageResizer'
import FormatConverter from '@/components/FormatConverter'
import ImageCropper from '@/components/ImageCropper'
import ImageRotator from '@/components/ImageRotator'
import ImageFlipper from '@/components/ImageFlipper'

export interface ToolConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: 'essential' | 'transform' | 'enhance' | 'style' | 'creative' | 'advanced'
  badge?: string
  available: boolean
  component?: React.ComponentType
  href: string
}

export const existingTools: ToolConfig[] = [
  // Essential Tools - 全て利用可能
  {
    id: 'compress',
    name: 'Image Compressor',
    description: 'Reduce file size without quality loss',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-blue-500',
    category: 'essential',
    badge: 'Popular',
    available: true,
    component: ImageCompressor,
    href: '/tools/compress'
  },
  {
    id: 'resize',
    name: 'Image Resizer',
    description: 'Change dimensions instantly',
    icon: <Maximize2 className="w-8 h-8" />,
    color: 'bg-purple-500',
    category: 'essential',
    available: true,
    component: ImageResizer,
    href: '/tools/resize'
  },
  {
    id: 'convert',
    name: 'Format Converter',
    description: 'JPG, PNG, WebP, AVIF, and more',
    icon: <RefreshCw className="w-8 h-8" />,
    color: 'bg-green-500',
    category: 'essential',
    badge: 'Recommended',
    available: true,
    component: FormatConverter,
    href: '/tools/convert'
  },

  // Transform Tools - 新たに3つ有効化
  {
    id: 'crop',
    name: 'Image Cropper',
    description: 'Crop to any size or ratio',
    icon: <Crop className="w-8 h-8" />,
    color: 'bg-orange-500',
    category: 'transform',
    badge: 'New',
    available: true, // 有効化
    component: ImageCropper,
    href: '/tools/crop'
  },
  {
    id: 'rotate',
    name: 'Image Rotator',
    description: 'Rotate by any angle',
    icon: <RotateCw className="w-8 h-8" />,
    color: 'bg-indigo-500',
    category: 'transform',
    available: true, // 有効化
    component: ImageRotator,
    href: '/tools/rotate'
  },
  {
    id: 'flip',
    name: 'Image Flipper',
    description: 'Flip horizontal or vertical',
    icon: <FlipHorizontal className="w-8 h-8" />,
    color: 'bg-pink-500',
    category: 'transform',
    available: true, // 有効化
    component: ImageFlipper,
    href: '/tools/flip'
  },

  // Enhance Tools - 今後実装予定
  {
    id: 'blur',
    name: 'Blur Image',
    description: 'Add blur effects',
    icon: <Droplets className="w-8 h-8" />,
    color: 'bg-cyan-500',
    category: 'enhance',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/blur'
  },
  {
    id: 'sharpen',
    name: 'Sharpen Image',
    description: 'Make images crisp and clear',
    icon: <Wand2 className="w-8 h-8" />,
    color: 'bg-red-500',
    category: 'enhance',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/sharpen'
  },
  {
    id: 'brightness',
    name: 'Brightness Adjust',
    description: 'Control brightness and contrast',
    icon: <Sun className="w-8 h-8" />,
    color: 'bg-yellow-500',
    category: 'enhance',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/brightness'
  },

  // Style Tools - 今後実装予定
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Convert to black and white',
    icon: <Moon className="w-8 h-8" />,
    color: 'bg-gray-600',
    category: 'style',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/grayscale'
  },
  {
    id: 'filter',
    name: 'Color Filter',
    description: 'Apply color filters',
    icon: <Palette className="w-8 h-8" />,
    color: 'bg-gradient-to-br from-red-500 to-yellow-500',
    category: 'style',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/filter'
  },
  {
    id: 'vintage',
    name: 'Vintage Effect',
    description: 'Add retro film effects',
    icon: <Camera className="w-8 h-8" />,
    color: 'bg-amber-600',
    category: 'style',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/vintage'
  },

  // Creative Tools - 今後実装予定
  {
    id: 'text',
    name: 'Add Text',
    description: 'Add text to images',
    icon: <Type className="w-8 h-8" />,
    color: 'bg-teal-500',
    category: 'creative',
    badge: 'Premium',
    available: false,
    href: '/tools/text'
  },
  {
    id: 'grid',
    name: 'Image Grid',
    description: 'Create photo collages',
    icon: <Grid3x3 className="w-8 h-8" />,
    color: 'bg-lime-500',
    category: 'creative',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/grid'
  },
  {
    id: 'round',
    name: 'Round Corners',
    description: 'Add rounded corners',
    icon: <Circle className="w-8 h-8" />,
    color: 'bg-violet-500',
    category: 'creative',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/round'
  },

  // Advanced Tools - AI機能（今後実装）
  {
    id: 'remove-bg',
    name: 'Background Remover',
    description: 'Remove image background',
    icon: <Eraser className="w-8 h-8" />,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    category: 'advanced',
    badge: 'AI Premium',
    available: false,
    href: '/tools/remove-bg'
  },
  {
    id: 'upscale',
    name: 'Image Upscaler',
    description: 'Enhance resolution with AI',
    icon: <Wand2 className="w-8 h-8" />,
    color: 'bg-gradient-to-br from-blue-500 to-purple-500',
    category: 'advanced',
    badge: 'AI Premium',
    available: false,
    href: '/tools/upscale'
  },
  {
    id: 'watermark',
    name: 'Watermark',
    description: 'Add or remove watermarks',
    icon: <Shield className="w-8 h-8" />,
    color: 'bg-slate-600',
    category: 'advanced',
    badge: 'Coming Soon',
    available: false,
    href: '/tools/watermark'
  },
]

// ツールを取得する関数
export function getToolById(id: string): ToolConfig | undefined {
  return existingTools.find(tool => tool.id === id)
}

export function getAvailableTools(): ToolConfig[] {
  return existingTools.filter(tool => tool.available)
}

export function getToolsByCategory(category: string): ToolConfig[] {
  return existingTools.filter(tool => tool.category === category)
}