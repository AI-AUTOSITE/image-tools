// app/page.tsx - 6 tools homepage
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Check, ChevronRight, Star, Sparkles, Grid, List } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { getAvailableTools } from '@/lib/tools/existing-tools'

export default function HomePage() {
  const { user, isPremium } = useAuth()
  const [visibleTools, setVisibleTools] = useState<string[]>([])
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [maxToolsToShow, setMaxToolsToShow] = useState(6) // デフォルト6個表示

  const availableTools = getAvailableTools() // 利用可能なツールのみ取得

  useEffect(() => {
    // Load user preferences
    const saved = localStorage.getItem('visible-tools')
    const savedMax = localStorage.getItem('max-tools-display')
    
    if (saved) {
      const savedTools = JSON.parse(saved)
      // 利用可能なツールのみフィルタリング
      const validTools = savedTools.filter((id: string) => 
        availableTools.some(tool => tool.id === id)
      )
      setVisibleTools(validTools)
    } else {
      // デフォルト: 利用可能な全ツールを表示
      setVisibleTools(availableTools.map(t => t.id))
    }

    if (savedMax) {
      setMaxToolsToShow(parseInt(savedMax))
    }

    // Load daily usage
    const usage = localStorage.getItem('daily-usage')
    if (usage) {
      const parsed = JSON.parse(usage)
      const today = new Date().toDateString()
      if (parsed.date === today) {
        setDailyUsage(parsed.usage)
      } else {
        // Reset daily usage
        const resetUsage: Record<string, number> = {}
        availableTools.forEach(tool => { resetUsage[tool.id] = 0 })
        localStorage.setItem('daily-usage', JSON.stringify({ date: today, usage: resetUsage }))
        setDailyUsage(resetUsage)
      }
    }
  }, [])

  const toggleTool = (toolId: string) => {
    let newVisible = [...visibleTools]
    
    if (visibleTools.includes(toolId)) {
      // Remove tool
      newVisible = visibleTools.filter(id => id !== toolId)
    } else {
      // Add tool
      newVisible = [...visibleTools, toolId]
    }
    
    setVisibleTools(newVisible)
    localStorage.setItem('visible-tools', JSON.stringify(newVisible))
  }

  const getUserTier = () => {
    if (isPremium) return 'Pro'
    if (user) return 'Free'
    return 'Guest'
  }

  const displayedTools = availableTools.filter(tool => visibleTools.includes(tool.id))
    .slice(0, maxToolsToShow)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            {/* User Status Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full text-sm font-medium
              bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              {getUserTier()} Account
              {!isPremium && user && (
                <Link href="/upgrade" className="ml-3 text-purple-600 hover:text-purple-700 font-semibold">
                  Upgrade →
                </Link>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple Image Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              6 professional tools. No uploads. Your images stay on your device.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-xs text-gray-500">Private</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {getUserTier() === 'Pro' ? '∞' : getUserTier() === 'Free' ? '10/day' : '3/day'}
                </div>
                <div className="text-xs text-gray-500">
                  {getUserTier() === 'Pro' ? 'Unlimited' : 'Per Tool'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {availableTools.length}
                </div>
                <div className="text-xs text-gray-500">Active Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing {displayedTools.length} of {availableTools.length} tools
              </span>
              {/* Max tools selector */}
              <select
                value={maxToolsToShow}
                onChange={(e) => {
                  const max = parseInt(e.target.value)
                  setMaxToolsToShow(max)
                  localStorage.setItem('max-tools-display', max.toString())
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="3">Show 3 tools</option>
                <option value="6">Show 6 tools</option>
                {availableTools.length >= 9 && <option value="9">Show 9 tools</option>}
                {availableTools.length >= 12 && <option value="12">Show 12 tools</option>}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  title="List view"
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Customize Button */}
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customizer Panel */}
      {showCustomizer && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose Your Tools
                </h3>
                <p className="text-sm text-gray-600">
                  Select which tools to display. {visibleTools.length} selected
                </p>
              </div>
              <button
                onClick={() => setShowCustomizer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Available Tools */}
            <div className="grid md:grid-cols-2 gap-3">
              {availableTools.map(tool => (
                <label
                  key={tool.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md`}
                  style={{
                    borderColor: visibleTools.includes(tool.id) ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: visibleTools.includes(tool.id) ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleTools.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    className="sr-only"
                  />
                  <div className={`${tool.color} w-8 h-8 rounded flex items-center justify-center text-white mr-3 text-xs`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{tool.name}</p>
                    <p className="text-xs text-gray-500">{tool.description}</p>
                  </div>
                  <div className="ml-2">
                    {visibleTools.includes(tool.id) ? (
                      <Check className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Tools Display */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {displayedTools.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? `grid gap-6 ${
                  maxToolsToShow <= 3 ? 'md:grid-cols-3' :
                  maxToolsToShow <= 6 ? 'md:grid-cols-3 lg:grid-cols-3' :
                  'md:grid-cols-3 lg:grid-cols-4'
                }`
              : 'space-y-4'
          }>
            {displayedTools.map(tool => {
              const usage = dailyUsage[tool.id] || 0
              const limit = isPremium ? null : (user ? 10 : 3)
              const remaining = limit ? limit - usage : null
              
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  usage={usage}
                  limit={limit}
                  remaining={remaining}
                  isPremium={isPremium}
                  viewMode={viewMode}
                  getUserTier={getUserTier}
                />
              )
            })}
          </div>
        ) : (
          <EmptyState onCustomize={() => setShowCustomizer(true)} />
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Our Tools?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Privacy</h3>
              <p className="text-sm text-gray-600">
                All processing happens in your browser. Your images never leave your device.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Sign-up Required</h3>
              <p className="text-sm text-gray-600">
                Start using immediately. Sign in only if you want to save preferences or upgrade.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Process multiple images in seconds with our optimized algorithms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Unlock Unlimited Access
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Remove all limits with Pro membership
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade to Pro - $9/month
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// Tool Card Component
function ToolCard({ tool, usage, limit, remaining, isPremium, viewMode, getUserTier }: any) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
              {tool.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {tool.badge && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {tool.badge}
              </span>
            )}
            <Link
              href={tool.href}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Open
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <Link href={tool.href} className="block">
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
              {tool.icon}
            </div>
            {tool.badge && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {tool.badge}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {tool.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {tool.description}
          </p>

          {/* Usage for non-premium users */}
          {!isPremium && limit && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Today's usage</span>
                <span className={`font-medium ${remaining && remaining <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                  {usage}/{limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    remaining && remaining <= 3 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((usage / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isPremium && (
            <div className="flex items-center text-xs text-purple-600">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Unlimited Usage
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ onCustomize }: { onCustomize: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <Settings className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Tools Selected
      </h3>
      <p className="text-gray-600 mb-6">
        Click the button below to select the tools you need
      </p>
      <button
        onClick={onCustomize}
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Settings className="w-5 h-5 mr-2" />
        Select Tools
      </button>
    </div>
  )
}