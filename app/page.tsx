// app/page.tsx - 拡張版ホームページ（15以上のツール）
import Link from 'next/link'
import { 
  Zap, Maximize2, RefreshCw, Crop, RotateCw, Droplets,
  Palette, Type, Grid3x3, FlipHorizontal, Image as ImageIcon,
  Circle, Layers, Eraser, Wand2, Sun, Moon, 
  Filter, Move, Scissors, Shield, Eye, Camera
} from 'lucide-react'

export default function HomePage() {
  const tools = [
    // Essential Tools (既存)
    {
      title: 'Image Compressor',
      description: 'Reduce file size without quality loss',
      icon: <Zap className="w-8 h-8" />,
      href: '/compress',
      badge: 'Popular',
      color: 'bg-blue-500',
      available: true,
      category: 'Essential'
    },
    {
      title: 'Image Resizer',
      description: 'Change dimensions instantly',
      icon: <Maximize2 className="w-8 h-8" />,
      href: '/resize',
      badge: null,
      color: 'bg-purple-500',
      available: true,
      category: 'Essential'
    },
    {
      title: 'Format Converter',
      description: 'JPG, PNG, WebP, AVIF, and more',
      icon: <RefreshCw className="w-8 h-8" />,
      href: '/convert',
      badge: null,
      color: 'bg-green-500',
      available: true,
      category: 'Essential'
    },

    // Transform Tools
    {
      title: 'Image Cropper',
      description: 'Crop to any size or ratio',
      icon: <Crop className="w-8 h-8" />,
      href: '/crop',
      badge: 'New',
      color: 'bg-orange-500',
      available: true,
      category: 'Transform'
    },
    {
      title: 'Image Rotator',
      description: 'Rotate by any angle',
      icon: <RotateCw className="w-8 h-8" />,
      href: '/rotate',
      badge: null,
      color: 'bg-indigo-500',
      available: true,
      category: 'Transform'
    },
    {
      title: 'Image Flipper',
      description: 'Flip horizontal or vertical',
      icon: <FlipHorizontal className="w-8 h-8" />,
      href: '/flip',
      badge: null,
      color: 'bg-pink-500',
      available: true,
      category: 'Transform'
    },

    // Enhance Tools
    {
      title: 'Blur Image',
      description: 'Add blur effects',
      icon: <Droplets className="w-8 h-8" />,
      href: '/blur',
      badge: null,
      color: 'bg-cyan-500',
      available: true,
      category: 'Enhance'
    },
    {
      title: 'Sharpen Image',
      description: 'Make images crisp and clear',
      icon: <Wand2 className="w-8 h-8" />,
      href: '/sharpen',
      badge: null,
      color: 'bg-red-500',
      available: true,
      category: 'Enhance'
    },
    {
      title: 'Brightness Adjust',
      description: 'Control brightness and contrast',
      icon: <Sun className="w-8 h-8" />,
      href: '/brightness',
      badge: null,
      color: 'bg-yellow-500',
      available: true,
      category: 'Enhance'
    },

    // Style Tools
    {
      title: 'Grayscale',
      description: 'Convert to black and white',
      icon: <Moon className="w-8 h-8" />,
      href: '/grayscale',
      badge: null,
      color: 'bg-gray-600',
      available: true,
      category: 'Style'
    },
    {
      title: 'Color Filter',
      description: 'Apply color filters',
      icon: <Palette className="w-8 h-8" />,
      href: '/filter',
      badge: 'Hot',
      color: 'bg-gradient-to-br from-red-500 to-yellow-500',
      available: true,
      category: 'Style'
    },
    {
      title: 'Vintage Effect',
      description: 'Add retro film effects',
      icon: <Camera className="w-8 h-8" />,
      href: '/vintage',
      badge: null,
      color: 'bg-amber-600',
      available: true,
      category: 'Style'
    },

    // Creative Tools
    {
      title: 'Add Text',
      description: 'Add text to images',
      icon: <Type className="w-8 h-8" />,
      href: '/text',
      badge: 'Premium',
      color: 'bg-teal-500',
      available: true,
      category: 'Creative'
    },
    {
      title: 'Image Grid',
      description: 'Create photo collages',
      icon: <Grid3x3 className="w-8 h-8" />,
      href: '/grid',
      badge: null,
      color: 'bg-lime-500',
      available: true,
      category: 'Creative'
    },
    {
      title: 'Round Corners',
      description: 'Add rounded corners',
      icon: <Circle className="w-8 h-8" />,
      href: '/round',
      badge: null,
      color: 'bg-violet-500',
      available: true,
      category: 'Creative'
    },

    // Advanced Tools
    {
      title: 'Background Remover',
      description: 'Remove image background',
      icon: <Eraser className="w-8 h-8" />,
      href: '/remove-bg',
      badge: 'AI Premium',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      available: true,
      category: 'Advanced'
    },
    {
      title: 'Image Upscaler',
      description: 'Enhance resolution with AI',
      icon: <Wand2 className="w-8 h-8" />,
      href: '/upscale',
      badge: 'AI Premium',
      color: 'bg-gradient-to-br from-blue-500 to-purple-500',
      available: true,
      category: 'Advanced'
    },
    {
      title: 'Watermark',
      description: 'Add or remove watermarks',
      icon: <Shield className="w-8 h-8" />,
      href: '/watermark',
      badge: null,
      color: 'bg-slate-600',
      available: true,
      category: 'Advanced'
    },
  ]

  const categories = [
    { name: 'Essential', description: 'Core image tools', icon: <Zap className="w-5 h-5" /> },
    { name: 'Transform', description: 'Resize, crop, rotate', icon: <Move className="w-5 h-5" /> },
    { name: 'Enhance', description: 'Improve image quality', icon: <Wand2 className="w-5 h-5" /> },
    { name: 'Style', description: 'Filters and effects', icon: <Palette className="w-5 h-5" /> },
    { name: 'Creative', description: 'Add elements', icon: <Type className="w-5 h-5" /> },
    { name: 'Advanced', description: 'AI-powered tools', icon: <Wand2 className="w-5 h-5" /> },
  ]

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: '100% Private',
      description: 'Files never leave your browser'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Process images instantly'
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: 'Batch Processing',
      description: 'Handle multiple files at once'
    },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4 mr-1" />
            15+ Free Tools Available
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Free Image Tools
          </h1>
          <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Professional image editing in your browser. No uploads, no registration, no limits.
          </p>
          <p className="text-sm text-gray-500">
            Your images stay on your device. 100% private, 100% free.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-8 mt-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">15+</div>
            <div className="text-sm text-gray-600">Tools</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">∞</div>
            <div className="text-sm text-gray-600">File Size</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">$0</div>
            <div className="text-sm text-gray-600">Forever</div>
          </div>
        </div>
      </div>

      {/* Tools by Category */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {categories.map((category) => (
          <div key={category.name} className="mb-12">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2 text-gray-700">
                {category.icon}
                <h2 className="text-2xl font-bold">{category.name}</h2>
              </div>
              <span className="ml-4 text-sm text-gray-500">{category.description}</span>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools
                .filter(tool => tool.category === category.name)
                .map((tool) => (
                  tool.available ? (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 p-6 border border-gray-100 hover:scale-105"
                    >
                      {tool.badge && (
                        <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                          tool.badge === 'Popular' ? 'bg-blue-100 text-blue-600' :
                          tool.badge === 'New' ? 'bg-green-100 text-green-600' :
                          tool.badge === 'Hot' ? 'bg-red-100 text-red-600' :
                          tool.badge.includes('Premium') ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                      <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tool.description}
                      </p>
                    </Link>
                  ) : (
                    <div
                      key={tool.href}
                      className="relative bg-white/50 rounded-xl shadow-sm p-6 border border-gray-200 opacity-60 cursor-not-allowed"
                    >
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
                        Coming Soon
                      </span>
                      <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 opacity-50`}>
                        {tool.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-500 mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                  )
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
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
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Editing Now
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            No sign up required. Choose any tool and start editing immediately.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/compress"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Image Compressor
            </Link>
            <Link
              href="/remove-bg"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Eraser className="w-5 h-5 mr-2" />
              Try Background Remover
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}