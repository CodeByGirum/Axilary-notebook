"use client"

import { useCallback } from "react"
import type { CellType, NotebookCellData } from "@/types/notebook"
import { generateId } from "./NotebookItems"

interface UseNotebookCellsProps {
  cells: NotebookCellData[]
  nextOrder: number
  onCellsChange: (cells: NotebookCellData[]) => void
  onOrderChange: (newOrder: number) => void
}

export function useNotebookCells({ cells, nextOrder, onCellsChange, onOrderChange }: UseNotebookCellsProps) {
  const addCell = useCallback(
    (type: CellType, afterId?: string) => {
      if (type === "text") return // Text sections handled separately

      const newCell: NotebookCellData = {
        id: generateId(),
        type,
        content: "",
        metadata: { title: `New ${type}` },
        order: nextOrder,
      }

      onCellsChange([...cells, newCell])
      onOrderChange(nextOrder + 1)
    },
    [cells, nextOrder, onCellsChange, onOrderChange],
  )

  const updateCell = useCallback(
    (id: string, updates: Partial<NotebookCellData>) => {
      onCellsChange(cells.map((cell) => (cell.id === id ? { ...cell, ...updates } : cell)))
    },
    [cells, onCellsChange],
  )

  const deleteCell = useCallback(
    (id: string) => {
      onCellsChange(cells.filter((cell) => cell.id !== id))
    },
    [cells, onCellsChange],
  )

  const duplicateCell = useCallback(
    (id: string) => {
      const cell = cells.find((c) => c.id === id)
      if (!cell) return

      const duplicate = {
        ...cell,
        id: generateId(),
        metadata: { ...cell.metadata, title: `${cell.metadata.title} Copy` },
      }

      const index = cells.findIndex((c) => c.id === id)
      const newCellsArray = [...cells]
      newCellsArray.splice(index + 1, 0, duplicate)
      onCellsChange(newCellsArray)
    },
    [cells, onCellsChange],
  )

  const handleGenerateCells = useCallback(
    (generatedCells: Partial<NotebookCellData>[], afterId?: string) => {
      const batchPrefix = `generated-${Date.now()}`
      const newCells = generatedCells.map((cellData, index) => ({
        id: generateId(batchPrefix),
        content: "",
        metadata: { title: "Generated Cell" },
        ...cellData,
      })) as NotebookCellData[]

      if (afterId) {
        const index = cells.findIndex((cell) => cell.id === afterId)
        const newCellsArray = [...cells]
        newCellsArray.splice(index + 1, 0, ...newCells)
        onCellsChange(newCellsArray)
      } else {
        onCellsChange([...cells, ...newCells])
      }
    },
    [cells, onCellsChange],
  )

  return {
    addCell,
    updateCell,
    deleteCell,
    duplicateCell,
    handleGenerateCells,
  }
}
