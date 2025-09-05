"use client"

import { useState, useCallback } from "react"
import type { NotebookItem, ClipboardData, TextSectionData } from "./NotebookItems"
import { generateId } from "./NotebookItems"
import { generatePlainText } from "./PlainText"
import type { NotebookCellData } from "@/types/notebook"

interface UseNotebookClipboardProps {
  items: NotebookItem[]
  selectedCells: Set<string>
  lastFocusedCell: string | null
  onItemsInsert: (newItems: NotebookItem[], insertionIndex: number) => void
  onItemsRemove: (itemIds: Set<string>) => void
  clearSelection: () => void
}

export function useNotebookClipboard({
  items,
  selectedCells,
  lastFocusedCell,
  onItemsInsert,
  onItemsRemove,
  clearSelection,
}: UseNotebookClipboardProps) {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null)

  const getSelectedItemsInOrder = useCallback(() => {
    return items.filter((item) => selectedCells.has(item.id)).sort((a, b) => a.order - b.order)
  }, [items, selectedCells])

  const writeToSystemClipboard = useCallback(async (data: ClipboardData) => {
    try {
      // Write structured JSON as primary format
      await navigator.clipboard.writeText(JSON.stringify(data))
    } catch (error) {
      // Fallback to plain text only if JSON fails
      try {
        await navigator.clipboard.writeText(data.plainText)
      } catch (fallbackError) {
        console.warn("[v0] Failed to write to clipboard:", fallbackError)
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (selectedCells.size === 0) return

    const selectedItems = getSelectedItemsInOrder()
    const plainText = generatePlainText(selectedItems)

    const clipboardPayload: ClipboardData = {
      type: "axilary-notebook-cells",
      version: "1.0",
      items: selectedItems,
      plainText,
    }

    setClipboardData(clipboardPayload)
    await writeToSystemClipboard(clipboardPayload)

    console.log("[v0] Copied", selectedItems.length, "items to clipboard")
  }, [selectedCells, getSelectedItemsInOrder, writeToSystemClipboard])

  const handleCut = useCallback(async () => {
    if (selectedCells.size === 0) return

    await handleCopy()

    // Remove selected items
    const selectedIds = new Set(selectedCells)
    onItemsRemove(selectedIds)
    clearSelection()

    console.log("[v0] Cut", selectedIds.size, "items")
  }, [selectedCells, handleCopy, onItemsRemove, clearSelection])

  const handlePaste = useCallback(async () => {
    let dataToUse = clipboardData

    // Try to get data from system clipboard if no internal data
    if (!dataToUse) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        const parsed = JSON.parse(clipboardText)
        if (parsed.type === "axilary-notebook-cells") {
          dataToUse = parsed
        }
      } catch (error) {
        console.warn("[v0] Failed to parse clipboard data:", error)
        return
      }
    }

    if (!dataToUse) return

    // Find insertion point (after last focused cell)
    const insertionIndex = lastFocusedCell ? items.findIndex((item) => item.id === lastFocusedCell) + 1 : items.length

    // Create new items with new IDs
    const batchPrefix = `paste-${Date.now()}`
    const newItems = dataToUse.items.map((item, index) => {
      const newId = generateId(batchPrefix)
      const newOrder = insertionIndex + index

      if (item.type === "text") {
        const textData = item.data as TextSectionData
        return {
          id: newId,
          type: "text" as const,
          data: { ...textData, id: newId, order: newOrder },
          order: newOrder,
        }
      } else {
        const cellData = item.data as NotebookCellData
        return {
          id: newId,
          type: "cell" as const,
          data: { ...cellData, id: newId, order: newOrder },
          order: newOrder,
        }
      }
    })

    onItemsInsert(newItems, insertionIndex)
    console.log("[v0] Pasted", newItems.length, "items")
  }, [clipboardData, lastFocusedCell, items, onItemsInsert])

  const handleDuplicate = useCallback(() => {
    if (selectedCells.size === 0) return

    const selectedItems = getSelectedItemsInOrder()
    const lastSelectedItem = selectedItems[selectedItems.length - 1]
    const insertionIndex = items.findIndex((item) => item.id === lastSelectedItem.id) + 1

    // Create duplicates
    const batchPrefix = `duplicate-${Date.now()}`
    const duplicateItems = selectedItems.map((item, index) => {
      const newId = generateId(batchPrefix)
      const newOrder = insertionIndex + index

      if (item.type === "text") {
        const textData = item.data as TextSectionData
        return {
          id: newId,
          type: "text" as const,
          data: { ...textData, id: newId, order: newOrder },
          order: newOrder,
        }
      } else {
        const cellData = item.data as NotebookCellData
        return {
          id: newId,
          type: "cell" as const,
          data: {
            ...cellData,
            id: newId,
            order: newOrder,
            metadata: { ...cellData.metadata, title: `${cellData.metadata.title} Copy` },
          },
          order: newOrder,
        }
      }
    })

    onItemsInsert(duplicateItems, insertionIndex)
    console.log("[v0] Duplicated", selectedItems.length, "items")
  }, [selectedCells, getSelectedItemsInOrder, items, onItemsInsert])

  return {
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
  }
}
