
// ===================================
// 3. app/tools/[toolId]/page.tsx - 動的ツールページ
// ===================================
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import UniversalToolWrapper from '@/components/UniversalToolWrapper'
import { toolRegistry } from '@/lib/tool-registry'

export async function generateStaticParams() {
  // すべてのツールIDを返す
  return toolRegistry.getEnabledTools().map((tool) => ({
    toolId: tool.id,
  }))
}

export async function generateMetadata({ params }: { params: { toolId: string } }) {
  const tool = toolRegistry.getTool(params.toolId)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  return {
    title: `${tool.name} - Free Online Tool | No Limits`,
    description: tool.description,
  }
}

export default function DynamicToolPage({ params }: { params: { toolId: string } }) {
  const tool = toolRegistry.getTool(params.toolId)

  if (!tool || !tool.available) {
    notFound()
  }

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
          <div className={`${tool.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
            {tool.icon}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {tool.name}
          </h1>
          <p className="text-lg text-gray-600">
            {tool.description}
          </p>
          {tool.badge && (
            <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {tool.badge}
            </span>
          )}
        </div>
        
        <UniversalToolWrapper tool={tool} />
      </div>
    </div>
  )
}
