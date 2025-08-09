// app/page.tsx - Homepage with tool selection
import Link from 'next/link'
import { ImageIcon, Maximize2, RefreshCw, Zap } from 'lucide-react'

export default function HomePage() {
  const tools = [
    {
      title: 'Image Compressor',
      description: 'Reduce file size without quality loss',
      icon: <Zap className="w-8 h-8" />,
      href: '/compress',
      badge: 'No Limits',
      color: 'bg-blue-500',
    },
    {
      title: 'Image Resizer',
      description: 'Change dimensions instantly',
      icon: <Maximize2 className="w-8 h-8" />,
      href: '/resize',
      badge: 'Coming Soon',
      color: 'bg-purple-500',
    },
    {
      title: 'Format Converter',
      description: 'JPG, PNG, WebP, and more',
      icon: <RefreshCw className="w-8 h-8" />,
      href: '/convert',
      badge: 'Coming Soon',
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Free Image Tools
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            No limits. No sign up. No BS.
          </p>
          <p className="text-sm text-gray-500">
            Process images directly in your browser. Your files never leave your device.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 p-8 border border-gray-100"
            >
              {tool.badge && (
                <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                  {tool.badge}
                </span>
              )}
              <div className={`${tool.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Private
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No File Limits
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Forever Free
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}