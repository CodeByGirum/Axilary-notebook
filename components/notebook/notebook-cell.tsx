"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { NotebookCellData, CellType } from "@/types/notebook"
import { CellContent } from "./cell-content"
import { CellContextMenu } from "./cell-context-menu"
import { MoreVertical, Trash2, Copy, Lock, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NotebookCellProps {
  cell: NotebookCellData
  onUpdate: (id: string, updates: Partial<NotebookCellData>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddCell: (type: CellType, afterId?: string) => void
  onExecute?: (cell: NotebookCellData) => void
  onGenerateCells?: (cells: Partial<NotebookCellData>[], afterId?: string) => void
  onConvertToText?: () => void
  dragHandleProps?: any
  onEmptyDelete?: () => void
}

export function NotebookCell({
  cell,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddCell,
  onExecute,
  onGenerateCells,
  onConvertToText,
  dragHandleProps,
  onEmptyDelete,
}: NotebookCellProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [hasSelection, setHasSelection] = useState(false)
  const [canPaste, setCanPaste] = useState(false)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
    })

    // Check if there's selected text
    const selection = window.getSelection()
    setHasSelection(selection ? selection.toString().length > 0 : false)

    // Check clipboard
    navigator.clipboard
      .readText()
      .then(() => {
        setCanPaste(true)
      })
      .catch(() => {
        setCanPaste(false)
      })
  }

  const handleCopy = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      await navigator.clipboard.writeText(selection.toString())
    }
  }

  const handleCut = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      await navigator.clipboard.writeText(selection.toString())
      document.execCommand("delete")
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      document.execCommand("insertText", false, text)
    } catch (error) {
      console.warn("[v0] Failed to paste:", error)
    }
  }

  const handleSplitCell = () => {
    // Get cursor position and split content
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const beforeText = cell.content.substring(0, range.startOffset)
      const afterText = cell.content.substring(range.endOffset)

      // Update current cell with before text
      onUpdate(cell.id, { content: beforeText })

      // Create new cell with after text
      // This would need to be implemented in the parent component
      console.log("[v0] Split cell - before:", beforeText, "after:", afterText)
    }
  }

  const handleRun = async () => {
    if (onExecute) {
      setIsRunning(true)
      try {
        await onExecute(cell)
      } finally {
        setIsRunning(false)
      }
    }
  }

  const handleContentChange = (content: string) => {
    onUpdate(cell.id, { content })
  }

  const handleGenerateCells = (generatedCells: Partial<NotebookCellData>[]) => {
    if (onGenerateCells) {
      onGenerateCells(generatedCells, cell.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Backspace" || e.key === "Delete") && cell.content.trim() === "" && onEmptyDelete) {
      e.preventDefault()
      onEmptyDelete()
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (!isDropdownOpen) {
      setIsHovered(false)
    }
  }

  const handleLock = () => {
    onUpdate(cell.id, {
      metadata: {
        ...cell.metadata,
        locked: !cell.metadata.locked,
      },
    })
  }

  return (
    <div
      className="w-full group relative transition-all duration-200 hover:bg-white/[0.02] rounded-lg p-2 -m-2"
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
        >
          <div className="w-4 h-4 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="drop-shadow-sm">
              <circle cx="3" cy="3" r="1" />
              <circle cx="9" cy="3" r="1" />
              <circle cx="3" cy="9" r="1" />
              <circle cx="9" cy="9" r="1" />
            </svg>
          </div>
        </div>
      )}

      {(isHovered || cell.metadata.locked || isDropdownOpen) && (
        <div className="absolute top-1 right-1 z-20 flex items-center gap-1">
          {(cell.type === "python" || cell.type === "r" || cell.type === "sql") && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-7 h-7 rounded-md bg-neutral-800/90 border border-neutral-600 flex items-center justify-center hover:bg-neutral-700 transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50"
              aria-label="Run cell"
            >
              <Play className={cn("w-3 h-3 text-neutral-300", isRunning && "animate-pulse")} fill="currentColor" />
            </button>
          )}

          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7 h-7 rounded-md bg-neutral-800/90 border border-neutral-600 flex items-center justify-center hover:bg-neutral-700 transition-colors shadow-lg backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-neutral-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-neutral-900 border-neutral-700 shadow-xl z-50"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(cell.id)
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleLock()
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Lock className="w-4 h-4 mr-2" />
                {cell.metadata.locked ? "Unlock" : "Lock"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(cell.id)
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CellContent
        cell={cell}
        onChange={handleContentChange}
        isRunning={isRunning}
        onGenerateCells={cell.type === "prompt" ? handleGenerateCells : undefined}
      />

      {contextMenu.visible && (
        <CellContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onSplitCell={handleSplitCell}
          onConvertToText={onConvertToText}
          hasSelection={hasSelection}
          canPaste={canPaste}
          isTextCell={false}
        />
      )}

      {/* <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-neutral-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" /> */}

      {cell.metadata.locked && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-2 h-2 text-yellow-500" />
        </div>
      )}
    </div>
  )
}
