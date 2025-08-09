
// ===================================
// app/compress/page.tsx - Image Compressor Tool
// ===================================
import ImageCompressor from '@/components/ImageCompressor'

export const metadata = {
  title: 'Free Image Compressor - No Limits | Compress JPG, PNG, WebP',
  description: 'Compress images without losing quality. No file size limits, no registration. Support JPG, PNG, WebP formats. 100% free and private.',
}

export default function CompressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Image Compressor
          </h1>
          <p className="text-lg text-gray-600">
            Reduce file size by up to 90% without visible quality loss
          </p>
        </div>
        <ImageCompressor />
      </div>
    </div>
  )
}
