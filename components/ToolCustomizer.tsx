
// ===================================
// 4. components/ToolCustomizer.tsx - ツールカスタマイザー
// ===================================
'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react'
import { toolRegistry } from '@/lib/tool-registry'

interface SortableToolItemProps {
  tool: any
  onToggle: (id: string, enabled: boolean) => void
}

function SortableToolItem({ tool, onToggle }: SortableToolItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tool.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-2"
    >
      <div className="flex items-center space-x-3">
        <button
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <div className={`${tool.color} w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm`}>
          {tool.icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{tool.name}</p>
          <p className="text-xs text-gray-500">{tool.description}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(tool.id, !tool.available)}
        className={`p-2 rounded-lg transition-colors ${
          tool.available 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        {tool.available ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>
    </div>
  )
}

export default function ToolCustomizer() {
  const [tools, setTools] = useState(toolRegistry.getEnabledTools())
  const [isOpen, setIsOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    toolRegistry.loadPreferences()
    setTools(toolRegistry.getEnabledTools())
  }, [])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTools((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Save new order
        toolRegistry.reorderTools(newOrder.map(t => t.id))
        
        return newOrder
      })
    }
  }

  const handleToggle = (id: string, enabled: boolean) => {
    toolRegistry.toggleTool(id, enabled)
    setTools(tools.map(tool => 
      tool.id === id ? { ...tool, available: enabled } : tool
    ))
  }

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>

      {/* Customizer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Customize Your Tools</h2>
              <p className="text-sm text-gray-600 mt-1">Drag to reorder, click eye icon to show/hide</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tools.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tools.map((tool) => (
                    <SortableToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={handleToggle}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}