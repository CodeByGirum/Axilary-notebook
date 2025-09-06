"use client"

import type React from "react"
import { useState } from "react"
import type { NotebookCellData, CellType } from "@/types/notebook"
import { CellContent } from "./cell-content"
import { CellContextMenu } from "./cell-context-menu"
import { CellActions } from "./cell-actions"

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

  const handleClipboardOperations = {
    copy: async () => {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        await navigator.clipboard.writeText(selection.toString())
      }
    },
    cut: async () => {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        await navigator.clipboard.writeText(selection.toString())
        document.execCommand("delete")
      }
    },
    paste: async () => {
      try {
        const text = await navigator.clipboard.readText()
        document.execCommand("insertText", false, text)
      } catch (error) {
        console.warn("[v0] Failed to paste:", error)
      }
    },
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true })
  }

  const handleRun = async () => {
    if (!onExecute) return

    setIsRunning(true)
    try {
      await onExecute(cell)
    } finally {
      setIsRunning(false)
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
      className="w-full group relative transition-all duration-200 hover:bg-white/[0.015] rounded-lg p-2 -m-2 border border-transparent hover:border-white/5"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDropdownOpen && setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute -left-8 top-2 opacity-30 hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
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

      <CellActions
        cell={cell}
        isHovered={true}
        isRunning={isRunning}
        isDropdownOpen={isDropdownOpen}
        onRun={handleRun}
        onDuplicate={() => onDuplicate(cell.id)}
        onLock={handleLock}
        onDelete={() => onDelete(cell.id)}
        onDropdownChange={setIsDropdownOpen}
      />

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
          onCopy={handleClipboardOperations.copy}
          onCut={handleClipboardOperations.cut}
          onPaste={handleClipboardOperations.paste}
          onSplitCell={() => {}} // Implementation needed
          onConvertToText={onConvertToText}
          hasSelection={false}
          canPaste={true}
          isTextCell={false}
        />
      )}

      {cell.metadata.locked && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
