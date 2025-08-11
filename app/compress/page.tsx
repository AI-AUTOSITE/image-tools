
// ===================================
// 1. app/compress/page.tsx - 圧縮ツールページ
// ===================================
import ImageCompressor from '@/components/ImageCompressor'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Free Image Compressor - No Limits | Compress JPG, PNG, WebP',
  description: 'Compress images without losing quality. No file size limits, no registration. Support JPG, PNG, WebP formats. 100% free and private.',
}

export default function CompressPage() {
    redirect('/tools/compress')
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
            Image Compressor
          </h1>
          <p className="text-lg text-gray-600">
            Reduce file size by up to 90% without visible quality loss
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center text-green-600">
              ✓ Unlimited files
            </span>
            <span className="flex items-center text-green-600">
              ✓ No size limits
            </span>
            <span className="flex items-center text-green-600">
              ✓ Batch processing
            </span>
          </div>
        </div>
        <ImageCompressor />
      </div>
    </div>
  )
}