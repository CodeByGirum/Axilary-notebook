"use client"

import { useCallback } from "react"
import type { NotebookItem, NotebookCellData, TextSectionData, SeparatorData } from "./NotebookItems"
import { separateItems } from "./NotebookItems"

interface UseNotebookReorderProps {
  items: NotebookItem[]
  selectedCells: Set<string>
  onItemsChange: (cells: NotebookCellData[], textSections: TextSectionData[], separators: SeparatorData[]) => void
}

export function useNotebookReorder({ items, selectedCells, onItemsChange }: UseNotebookReorderProps) {
  /**
   * Reorders items and updates state with proper order recalculation
   */
  const reorderItems = useCallback(
    (reorderedItems: NotebookItem[]) => {
      // Recalculate orders to ensure consistency
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
        data: { ...item.data, order: index },
      }))

      const { cells, textSections, separators } = separateItems(updatedItems)
      onItemsChange(cells, textSections, separators)
    },
    [onItemsChange],
  )

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return

      const draggedItemId = result.draggableId
      const isSelectedCell = selectedCells.has(draggedItemId)

      if (isSelectedCell && selectedCells.size > 1) {
        // Multi-cell drag: move all selected cells as a block
        const selectedItems = items.filter((item) => selectedCells.has(item.id))
        const nonSelectedItems = items.filter((item) => !selectedCells.has(item.id))

        // Sort selected items by their current order to maintain relative positioning
        selectedItems.sort((a, b) => a.order - b.order)

        // Insert the block at the destination
        const reorderedItems = [...nonSelectedItems]
        reorderedItems.splice(result.destination.index, 0, ...selectedItems)

        reorderItems(reorderedItems)
      } else {
        // Single cell drag: original behavior
        const reorderedItems = Array.from(items)
        const [reorderedItem] = reorderedItems.splice(result.source.index, 1)
        reorderedItems.splice(result.destination.index, 0, reorderedItem)

        reorderItems(reorderedItems)
      }
    },
    [items, selectedCells, reorderItems],
  )

  const handleMoveUp = useCallback(() => {
    if (selectedCells.size === 0) return

    const selectedItems = items.filter((item) => selectedCells.has(item.id))
    selectedItems.sort((a, b) => a.order - b.order)

    const firstSelectedIndex = items.findIndex((item) => item.id === selectedItems[0].id)
    if (firstSelectedIndex === 0) return // Already at top

    const reorderedItems = [...items]
    selectedItems.forEach((item) => {
      const currentIndex = reorderedItems.findIndex((i) => i.id === item.id)
      reorderedItems.splice(currentIndex, 1)
    })

    const insertIndex = Math.max(0, firstSelectedIndex - 1)
    reorderedItems.splice(insertIndex, 0, ...selectedItems)

    reorderItems(reorderedItems)
  }, [items, selectedCells, reorderItems])

  const handleMoveDown = useCallback(() => {
    if (selectedCells.size === 0) return

    const selectedItems = items.filter((item) => selectedCells.has(item.id))
    selectedItems.sort((a, b) => a.order - b.order)

    const lastSelectedIndex = items.findIndex((item) => item.id === selectedItems[selectedItems.length - 1].id)
    if (lastSelectedIndex === items.length - 1) return // Already at bottom

    const reorderedItems = [...items]
    selectedItems.forEach((item) => {
      const currentIndex = reorderedItems.findIndex((i) => i.id === item.id)
      reorderedItems.splice(currentIndex, 1)
    })

    const insertIndex = Math.min(reorderedItems.length, lastSelectedIndex - selectedItems.length + 2)
    reorderedItems.splice(insertIndex, 0, ...selectedItems)

    reorderItems(reorderedItems)
  }, [items, selectedCells, reorderItems])

  return {
    handleDragEnd,
    handleMoveUp,
    handleMoveDown,
  }
}
