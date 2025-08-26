"use client"

interface SelectionOverlayProps {
  selectionRect: { x: number; y: number; width: number; height: number } | null
  isSelecting: boolean
}

export function SelectionOverlay({ selectionRect, isSelecting }: SelectionOverlayProps) {
  if (!isSelecting || !selectionRect) return null

  return (
    <div
      className="absolute pointer-events-none z-30 border border-gray-400/30 border-dotted bg-gray-400/5 rounded-sm"
      style={{
        left: selectionRect.x,
        top: selectionRect.y,
        width: selectionRect.width,
        height: selectionRect.height,
      }}
    />
  )
}
