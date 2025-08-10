// ===================================
// 1. app/resize/page.tsx - リサイズツールページ
// ===================================
import ImageResizer from '@/components/ImageResizer'
import Link from 'next/link'
import { Home } from 'lucide-react'

export const metadata = {
  title: 'Free Image Resizer - Resize Images Online | No Limits',
  description: 'Resize images to any dimension instantly. Perfect for social media, web, and print. No registration required, 100% free.',
  keywords: 'image resizer, resize image online, change image dimensions, social media image sizes',
}

export default function ResizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Tools</span>
            </Link>
            <div className="text-sm text-gray-500">
              100% Free • No Registration • Private
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Image Resizer
          </h1>
          <p className="text-lg text-gray-600">
            Resize images to any dimension with perfect quality
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center text-green-600">
              ✓ Batch resize
            </span>
            <span className="flex items-center text-green-600">
              ✓ Aspect ratio lock
            </span>
            <span className="flex items-center text-green-600">
              ✓ Social media presets
            </span>
          </div>
        </div>
        <ImageResizer />
      </div>
    </div>
  )
}
