
// ===================================
// 1. app/convert/page.tsx - 変換ツールページ
// ===================================
import FormatConverter from '@/components/FormatConverter'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { redirect } from 'next/navigation'


export const metadata = {
  title: 'Free Image Format Converter - JPG, PNG, WebP, AVIF | No Limits',
  description: 'Convert images between JPG, PNG, WebP, AVIF, and more formats. Fast, free, and private. No registration required.',
  keywords: 'image converter, convert jpg to png, webp converter, avif converter, format conversion',
}

export default function ConvertPage() {
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
            Format Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert images between any format with perfect quality
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center text-green-600">
              ✓ Modern formats (WebP, AVIF)
            </span>
            <span className="flex items-center text-green-600">
              ✓ Batch conversion
            </span>
            <span className="flex items-center text-green-600">
              ✓ Quality control
            </span>
          </div>
        </div>
        <FormatConverter />
      </div>
    </div>
  )
}
