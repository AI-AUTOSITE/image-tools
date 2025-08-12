// app/tools/[toolId]/page.tsx
import { notFound } from 'next/navigation'
import { getToolById } from '@/lib/tools/existing-tools'
import UniversalToolWrapper from '@/components/UniversalToolWrapper'

export async function generateStaticParams() {
  // 利用可能なツールIDのリストを生成
  const toolIds = ['compress', 'resize', 'convert', 'crop', 'rotate', 'flip', 'blur', 'sharpen', 'brightness', 'grayscale', 'filter', 'vintage', 'text', 'grid', 'round', 'remove-bg', 'upscale', 'watermark']
  
  return toolIds.map((id) => ({
    toolId: id,
  }))
}

// Next.js 15用の型定義
type Props = {
  params: Promise<{ toolId: string }>
}

export async function generateMetadata({ params }: Props) {
  // Next.js 15ではparamsがPromiseなのでawaitが必要
  const resolvedParams = await params
  const tool = getToolById(resolvedParams.toolId)
  
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

export default async function DynamicToolPage({ params }: Props) {
  // Next.js 15ではparamsがPromiseなのでawaitが必要
  const resolvedParams = await params
  const tool = getToolById(resolvedParams.toolId)

  if (!tool) {
    notFound()
  }

  // ツールが利用可能でない場合は「Coming Soon」を表示
  if (!tool.available) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className={`${tool.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mx-auto mb-4 opacity-50`}>
              {tool.icon}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {tool.name}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {tool.description}
            </p>
            {tool.badge && (
              <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold">
                Coming Soon
              </span>
            )}
            <div className="mt-12 p-8 bg-white rounded-xl shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🚧 Under Construction
              </h2>
              <p className="text-gray-600">
                This tool is currently being developed and will be available soon.
                Check back later for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // コンポーネントが定義されている場合は表示
  const ToolComponent = tool.component
  
  if (ToolComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          
          <ToolComponent />
        </div>
      </div>
    )
  }

  // UniversalToolWrapperを使用（tool-registryを使用する場合）
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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