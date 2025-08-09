import Link from 'next/link'
import { ImageIcon, Maximize2, RefreshCw, Zap, Shield, Globe, Sparkles } from 'lucide-react'

export default function HomePage() {
  const tools = [
    {
      title: 'Image Compressor',
      description: 'Reduce file size without quality loss',
      icon: <Zap className="w-8 h-8" />,
      href: '/compress',
      badge: 'No Limits',
      color: 'bg-blue-500',
      available: true,
    },
    {
      title: 'Image Resizer',
      description: 'Change dimensions instantly',
      icon: <Maximize2 className="w-8 h-8" />,
      href: '/resize',
      badge: 'Coming Soon',
      color: 'bg-purple-500',
      available: false,
    },
    {
      title: 'Format Converter',
      description: 'JPG, PNG, WebP, and more',
      icon: <RefreshCw className="w-8 h-8" />,
      href: '/convert',
      badge: 'Coming Soon',
      color: 'bg-green-500',
      available: false,
    },
  ]

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: '100% Private',
      description: 'Files never leave your browser'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'No File Limits',
      description: 'Process any size, any quantity'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Forever Free',
      description: 'Core features always free'
    },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
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
            tool.available ? (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 p-8 border border-gray-100 hover:scale-105"
              >
                {tool.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                    {tool.badge}
                  </span>
                )}
                <div className={`${tool.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ) : (
              <div
                key={tool.href}
                className="relative bg-white/50 rounded-xl shadow-sm p-8 border border-gray-200 opacity-60 cursor-not-allowed"
              >
                <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
                  {tool.badge}
                </span>
                <div className={`${tool.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 opacity-50`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-400">
                  {tool.description}
                </p>
              </div>
            )
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Tools?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
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

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            No registration required. Start compressing images right now!
          </p>
          <Link
            href="/compress"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-5 h-5 mr-2" />
            Try Image Compressor
          </Link>
        </div>
      </div>
    </div>
  )
}