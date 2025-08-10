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
  component: React.ComponentType<ToolComponentProps>
  processImage: (file: File, options: any) => Promise<ProcessedImage>
  defaultOptions?: any
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

export interface ToolComponentProps {
  onProcess: (files: File[]) => void
  isProcessing: boolean
  results: ProcessedImage[]
  options: any
  onOptionsChange: (options: any) => void
}

// ツールレジストリ（シングルトン）
class ToolRegistry {
  private tools: Map<string, ToolConfig> = new Map()
  private enabledTools: Set<string> = new Set()

  // ツールを登録
  register(tool: ToolConfig) {
    this.tools.set(tool.id, tool)
    if (tool.available) {
      this.enabledTools.add(tool.id)
    }
  }

  // ツールを取得
  getTool(id: string): ToolConfig | undefined {
    return this.tools.get(id)
  }

  // 有効なツールを取得
  getEnabledTools(): ToolConfig[] {
    return Array.from(this.enabledTools)
      .map(id => this.tools.get(id))
      .filter(Boolean) as ToolConfig[]
  }

  // カテゴリ別にツールを取得
  getToolsByCategory(category: string): ToolConfig[] {
    return this.getEnabledTools().filter(tool => tool.category === category)
  }

  // ツールの有効/無効を切り替え
  toggleTool(id: string, enabled: boolean) {
    if (enabled) {
      this.enabledTools.add(id)
    } else {
      this.enabledTools.delete(id)
    }
    // LocalStorageに保存
    this.savePreferences()
  }

  // ツールの順序を変更
  reorderTools(toolIds: string[]) {
    // 新しい順序で再構築
    const newTools = new Map<string, ToolConfig>()
    toolIds.forEach(id => {
      const tool = this.tools.get(id)
      if (tool) {
        newTools.set(id, tool)
      }
    })
    // 残りのツールを追加
    this.tools.forEach((tool, id) => {
      if (!newTools.has(id)) {
        newTools.set(id, tool)
      }
    })
    this.tools = newTools
    this.savePreferences()
  }

  // ユーザー設定を保存
  private savePreferences() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tool-preferences', JSON.stringify({
        enabled: Array.from(this.enabledTools),
        order: Array.from(this.tools.keys())
      }))
    }
  }

  // ユーザー設定を読み込み
  loadPreferences() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tool-preferences')
      if (saved) {
        const { enabled, order } = JSON.parse(saved)
        this.enabledTools = new Set(enabled)
        if (order) {
          this.reorderTools(order)
        }
      }
    }
  }
}

export const toolRegistry = new ToolRegistry()