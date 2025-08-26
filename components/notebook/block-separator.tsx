"use client"

import { AddCellMenu } from "./add-cell-menu"
import type { CellType } from "@/types/notebook"

interface BlockSeparatorProps {
  onAddCell: (type: CellType) => void
  onAddSeparator?: (style: string) => void
}

export function BlockSeparator({ onAddCell, onAddSeparator }: BlockSeparatorProps) {
  const handleAddSeparator = (style: string) => {
    // For now, we'll treat separators as a special type of content
    // This could be expanded to create actual separator elements
    console.log(`Adding separator with style: ${style}`)
    onAddSeparator?.(style)
  }

  return (
    <div className="relative flex items-center justify-center py-4">
      <AddCellMenu onAddCell={onAddCell} onAddSeparator={handleAddSeparator} />
    </div>
  )
}
