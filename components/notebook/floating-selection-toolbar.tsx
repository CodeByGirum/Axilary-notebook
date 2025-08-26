"use client"

import { Copy, Scissors, Trash2, ArrowUp, ArrowDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingSelectionToolbarProps {
  selectedCount: number
  position: { x: number; y: number }
  onCopy: () => void
  onCut: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onClear: () => void
}

export function FloatingSelectionToolbar({
  selectedCount,
  position,
  onCopy,
  onCut,
  onDelete,
  onMoveUp,
  onMoveDown,
  onClear,
}: FloatingSelectionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="fixed z-50 bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg shadow-xl p-2 flex items-center gap-1"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <span className="text-xs text-neutral-400 px-2">
        {selectedCount} cell{selectedCount !== 1 ? "s" : ""} selected
      </span>

      <div className="w-px h-4 bg-neutral-700 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        className="h-7 w-7 p-0 hover:bg-neutral-800"
        title="Copy (Ctrl+C)"
      >
        <Copy className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCut}
        className="h-7 w-7 p-0 hover:bg-neutral-800"
        title="Cut (Ctrl+X)"
      >
        <Scissors className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-7 w-7 p-0 hover:bg-neutral-800 hover:text-red-400"
        title="Delete"
      >
        <Trash2 className="w-3 h-3" />
      </Button>

      <div className="w-px h-4 bg-neutral-700 mx-1" />

      <Button variant="ghost" size="sm" onClick={onMoveUp} className="h-7 w-7 p-0 hover:bg-neutral-800" title="Move Up">
        <ArrowUp className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onMoveDown}
        className="h-7 w-7 p-0 hover:bg-neutral-800"
        title="Move Down"
      >
        <ArrowDown className="w-3 h-3" />
      </Button>

      <div className="w-px h-4 bg-neutral-700 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-7 w-7 p-0 hover:bg-neutral-800"
        title="Clear Selection (Esc)"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}
