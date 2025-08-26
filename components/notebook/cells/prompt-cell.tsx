"use client"

import { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { useAIGeneration } from "@/hooks/use-ai-generation"
import type { NotebookCellData } from "@/types/notebook"

interface PromptCellProps {
  content: string
  onChange: (content: string) => void
  onGenerateCells?: (cells: Partial<NotebookCellData>[]) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function PromptCell({ content, onChange, onGenerateCells, isRunning, isLocked = false }: PromptCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { generateCells, isGenerating, error } = useAIGeneration()

  const isProcessing = isRunning || isGenerating

  const handleGenerate = async () => {
    if (!content.trim()) return

    const result = await generateCells({
      prompt: content,
      targetCells: ["markdown", "python", "sql", "chart", "r"],
    })

    if (result.success && onGenerateCells) {
      onGenerateCells(result.cells)
    }
  }

  // Make generate function available to parent
  ;(PromptCell as any).handleGenerate = handleGenerate

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-neutral-400" />
          <span className="text-white/70 text-base">Prompt</span>
          {isProcessing && <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />}
        </div>

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="Describe what you want to generate..."
            className="w-full bg-transparent border-none outline-none resize-none text-white/90 text-base leading-relaxed"
            rows={Math.max(3, content.split("\n").length)}
            autoFocus
            readOnly={isLocked}
          />
        ) : (
          <div
            onClick={() => !isLocked && setIsEditing(true)}
            className="cursor-text text-base leading-relaxed text-white/90 min-h-[3rem] flex items-center"
          >
            {content || <span className="text-white/40">Click to add prompt...</span>}
          </div>
        )}

        {isProcessing && (
          <div className="p-3 bg-neutral-800/20 border border-neutral-600/20 rounded-md">
            <div className="flex items-center gap-2 text-neutral-300 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating cells based on your prompt...
            </div>
          </div>
        )}

        {error && <div className="text-neutral-400 text-sm">{error}</div>}
      </div>
    </div>
  )
}
