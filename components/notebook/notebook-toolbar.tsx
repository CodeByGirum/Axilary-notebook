"use client"

import { Button } from "@/components/ui/button"
import { PlayCircle, Trash2 } from "lucide-react"
import { useState } from "react"

interface NotebookToolbarProps {
  onExecuteAll: () => void
  onClearAll: () => void
  isExecuting: boolean
}

export function NotebookToolbar({ onExecuteAll, onClearAll, isExecuting }: NotebookToolbarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClearAll = () => {
    setShowClearConfirm(true)
  }

  const confirmClearAll = () => {
    onClearAll()
    setShowClearConfirm(false)
  }

  const cancelClear = () => {
    setShowClearConfirm(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearAll}
        className="bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-xs px-2 py-1 h-6"
      >
        <Trash2 className="h-2.5 w-2.5 mr-1" />
        Clear All
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExecuteAll}
        disabled={isExecuting}
        className="bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-xs px-2 py-1 h-6"
      >
        <PlayCircle className="h-2.5 w-2.5 mr-1" />
        Run All
      </Button>

      <div className="text-[8px] text-white/40 ml-auto">{isExecuting ? "Executing..." : "Ready"}</div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 max-w-sm mx-4">
            <h3 className="text-white text-sm font-medium mb-2">Clear All Cells</h3>
            <p className="text-neutral-400 text-xs mb-4">
              This will permanently delete all cells and text sections. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelClear}
                className="bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-xs px-3 py-1 h-7"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={confirmClearAll}
                className="bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs px-3 py-1 h-7"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
