"use client"
import { cn } from "@/lib/utils"
import type { NotebookCellData } from "@/types/notebook"
import { MoreVertical, Trash2, Copy, Lock, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CellActionsProps {
  cell: NotebookCellData
  isHovered: boolean
  isRunning: boolean
  isDropdownOpen: boolean
  onRun: () => void
  onDuplicate: () => void
  onLock: () => void
  onDelete: () => void
  onDropdownChange: (open: boolean) => void
}

export function CellActions({
  cell,
  isHovered,
  isRunning,
  isDropdownOpen,
  onRun,
  onDuplicate,
  onLock,
  onDelete,
  onDropdownChange,
}: CellActionsProps) {
  const canRun = cell.type === "python" || cell.type === "r" || cell.type === "sql"
  const shouldShow = isHovered || cell.metadata.locked || isDropdownOpen

  if (!shouldShow) return null

  return (
    <div className="absolute top-1 right-1 z-20 flex items-center gap-1">
      {canRun && (
        <button
          onClick={onRun}
          disabled={isRunning}
          className="w-7 h-7 rounded-md bg-neutral-800/90 border border-neutral-600 flex items-center justify-center hover:bg-neutral-700 transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50"
          aria-label="Run cell"
        >
          <Play className={cn("w-3 h-3 text-neutral-300", isRunning && "animate-pulse")} fill="currentColor" />
        </button>
      )}

      <DropdownMenu onOpenChange={onDropdownChange}>
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
              onDuplicate()
            }}
            className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onLock()
            }}
            className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <Lock className="w-4 h-4 mr-2" />
            {cell.metadata.locked ? "Unlock" : "Lock"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
