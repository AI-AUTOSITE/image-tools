// ===================================
// 1. lib/tool-registry.ts - ツール登録システム
// ===================================
import { ReactNode } from 'react'

export interface ToolConfig {
  id: string
  name: string
  description: string
  icon: ReactNode
  color: string
  category: 'essential' | 'transform' | 'enhance' | 'style' | 'creative' | 'advanced'
  badge?: string
  available: boolean
  isPremium?: boolean
  processImage: (file: File, options: any) => Promise<ProcessedImage>
  defaultOptions?: any
  optionsComponent?: React.ComponentType<ToolOptionsProps>
}

export interface ProcessedImage {
  blob: Blob
  url: string
  metadata?: {
    originalSize: number
    processedSize: number
    width?: number
    height?: number
    [key: string]: any
  }
}

export interface ToolOptionsProps {
  options: any
  onChange: (options: any) => void
}

class ToolRegistry {
  private tools: Map<string, ToolConfig> = new Map()
  private enabledTools: Set<string> = new Set()
  private toolOrder: string[] = []

  register(tool: ToolConfig) {
    this.tools.set(tool.id, tool)
    if (tool.available) {
      this.enabledTools.add(tool.id)
    }
    if (!this.toolOrder.includes(tool.id)) {
      this.toolOrder.push(tool.id)
    }
  }

  getTool(id: string): ToolConfig | undefined {
    return this.tools.get(id)
  }

  getAllTools(): ToolConfig[] {
    return this.toolOrder
      .map(id => this.tools.get(id))
      .filter(Boolean) as ToolConfig[]
  }

  getEnabledTools(): ToolConfig[] {
    return this.toolOrder
      .filter(id => this.enabledTools.has(id))
      .map(id => this.tools.get(id))
      .filter(Boolean) as ToolConfig[]
  }

  getToolsByCategory(category: string): ToolConfig[] {
    return this.getEnabledTools().filter(tool => tool.category === category)
  }

  toggleTool(id: string, enabled: boolean) {
    const tool = this.tools.get(id)
    if (tool) {
      tool.available = enabled
      if (enabled) {
        this.enabledTools.add(id)
      } else {
        this.enabledTools.delete(id)
      }
      this.savePreferences()
    }
  }

  reorderTools(toolIds: string[]) {
    this.toolOrder = toolIds
    this.savePreferences()
  }

  private savePreferences() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tool-preferences', JSON.stringify({
        enabled: Array.from(this.enabledTools),
        order: this.toolOrder
      }))
    }
  }

  loadPreferences() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tool-preferences')
      if (saved) {
        try {
          const { enabled, order } = JSON.parse(saved)
          if (enabled) {
            this.enabledTools = new Set(enabled)
            // Update tool availability
            this.tools.forEach((tool, id) => {
              tool.available = this.enabledTools.has(id)
            })
          }
          if (order && Array.isArray(order)) {
            // Ensure all tools are in the order
            const missingTools = Array.from(this.tools.keys()).filter(id => !order.includes(id))
            this.toolOrder = [...order, ...missingTools]
          }
        } catch (e) {
          console.error('Failed to load preferences:', e)
        }
      }
    }
  }
}

export const toolRegistry = new ToolRegistry()
