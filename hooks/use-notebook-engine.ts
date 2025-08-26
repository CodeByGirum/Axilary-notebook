"use client"

import { useState, useCallback } from "react"
import { notebookEngine } from "@/lib/notebook-engine"
import type { NotebookCellData, CellExecutionResult } from "@/types/notebook"

export function useNotebookEngine() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<Record<string, CellExecutionResult>>({})

  const executeCell = useCallback(async (cell: NotebookCellData): Promise<CellExecutionResult> => {
    setIsExecuting(true)

    try {
      const result = await notebookEngine.executeCell(cell)
      setExecutionResults((prev) => ({ ...prev, [cell.id]: result }))
      return result
    } finally {
      setIsExecuting(false)
    }
  }, [])

  const executeAllCells = useCallback(async (cells: NotebookCellData[]): Promise<void> => {
    setIsExecuting(true)

    try {
      await notebookEngine.executeNotebook(cells)
    } finally {
      setIsExecuting(false)
    }
  }, [])

  const restartKernel = useCallback(async (): Promise<void> => {
    await notebookEngine.restartKernel()
    setExecutionResults({})
  }, [])

  const interruptExecution = useCallback(async (): Promise<void> => {
    await notebookEngine.interruptExecution()
    setIsExecuting(false)
  }, [])

  return {
    isExecuting,
    executionResults,
    executeCell,
    executeAllCells,
    restartKernel,
    interruptExecution,
  }
}
