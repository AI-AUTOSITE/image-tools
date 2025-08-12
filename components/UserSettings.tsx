// components/UserSettings.tsx - User customization settings
'use client'

import { useState, useEffect } from 'react'
import { X, Save, RotateCcw, Eye, EyeOff, Palette, Layout, Bell } from 'lucide-react'

interface UserPreferences {
  visibleTools: string[]
  theme: 'light' | 'dark' | 'auto'
  compactMode: boolean
  notifications: boolean
  defaultQuality: number
  autoDownload: boolean
}

interface UserSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    visibleTools: ['compress', 'resize', 'convert'],
    theme: 'light',
    compactMode: false,
    notifications: true,
    defaultQuality: 0.8,
    autoDownload: false
  })

  const [saved, setSaved] = useState(false)

  const availableTools = [
    { id: 'compress', name: 'Image Compressor', description: 'Reduce file sizes' },
    { id: 'resize', name: 'Image Resizer', description: 'Change dimensions' },
    { id: 'convert', name: 'Format Converter', description: 'Convert between formats' }
  ]

  useEffect(() => {
    // Load preferences from localStorage
    const stored = localStorage.getItem('user-preferences')
    if (stored) {
      setPreferences(JSON.parse(stored))
    }
  }, [])

  const savePreferences = () => {
    localStorage.setItem('user-preferences', JSON.stringify(preferences))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Apply theme immediately
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const resetToDefaults = () => {
    const defaults: UserPreferences = {
      visibleTools: ['compress', 'resize', 'convert'],
      theme: 'light',
      compactMode: false,
      notifications: true,
      defaultQuality: 0.8,
      autoDownload: false
    }
    setPreferences(defaults)
    localStorage.setItem('user-preferences', JSON.stringify(defaults))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleTool = (toolId: string) => {
    setPreferences(prev => ({
      ...prev,
      visibleTools: prev.visibleTools.includes(toolId)
        ? prev.visibleTools.filter(id => id !== toolId)
        : [...prev.visibleTools, toolId]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Tool Visibility */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Visible Tools</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Choose which tools appear on your homepage
              </p>
              <div className="space-y-3">
                {availableTools.map(tool => (
                  <label
                    key={tool.id}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: preferences.visibleTools.includes(tool.id) ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: preferences.visibleTools.includes(tool.id) ? '#eff6ff' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.visibleTools.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{tool.name}</p>
                      <p className="text-sm text-gray-500">{tool.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Display Settings */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Layout className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Display</h3>
              </div>
              
              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'auto'] as const).map(theme => (
                      <button
                        key={theme}
                        onClick={() => setPreferences(prev => ({ ...prev, theme }))}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          preferences.theme === theme
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Compact Mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={(e) => setPreferences(prev => ({ ...prev, compactMode: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </section>

            {/* Processing Settings */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Palette className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Processing Defaults</h3>
              </div>
              
              <div className="space-y-4">
                {/* Default Quality */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Default Image Quality: {Math.round(preferences.defaultQuality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={preferences.defaultQuality}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultQuality: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                {/* Auto Download */}
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Auto Download</p>
                    <p className="text-sm text-gray-500">Automatically download processed images</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoDownload}
                    onChange={(e) => setPreferences(prev => ({ ...prev, autoDownload: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </section>

            {/* Notifications */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              </div>
              
              <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Processing Notifications</p>
                  <p className="text-sm text-gray-500">Show notifications when processing completes</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
            <button
              onClick={resetToDefaults}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </button>
            
            <div className="flex items-center space-x-3">
              {saved && (
                <span className="text-green-600 text-sm font-medium">
                  ✓ Saved
                </span>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}