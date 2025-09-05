"use client"

import { useState, useCallback } from "react"
import type { NotebookCellData } from "@/types/notebook"
import type { TextSectionData } from "./NotebookItems"

interface NotebookState {
  cells: NotebookCellData[]
  textSections: TextSectionData[]
}

const MAX_HISTORY_SIZE = 50

/**
 * Deep clone function for notebook state
 */
function deepCloneState(state: NotebookState): NotebookState {
  return {
    cells: state.cells.map((cell) => ({
      ...cell,
      metadata: { ...cell.metadata },
      output: cell.output ? { ...cell.output } : undefined,
    })),
    textSections: state.textSections.map((section) => ({ ...section })),
  }
}

export function useUndoHistory() {
  const [undoHistory, setUndoHistory] = useState<NotebookState[]>([])
  const [redoHistory, setRedoHistory] = useState<NotebookState[]>([])

  const saveStateForUndo = useCallback((cells: NotebookCellData[], textSections: TextSectionData[]) => {
    const state = { cells, textSections }
    const clonedState = deepCloneState(state)

    setUndoHistory((prev) => {
      const newHistory = [...prev, clonedState]
      // Keep only the last MAX_HISTORY_SIZE entries
      return newHistory.slice(-MAX_HISTORY_SIZE)
    })

    // Clear redo history when new action is performed
    setRedoHistory([])
  }, [])

  const undo = useCallback((): NotebookState | null => {
    if (undoHistory.length === 0) return null

    const lastState = undoHistory[undoHistory.length - 1]
    const clonedState = deepCloneState(lastState)

    setUndoHistory((prev) => prev.slice(0, -1))
    setRedoHistory((prev) => [...prev, clonedState])

    return clonedState
  }, [undoHistory])

  const redo = useCallback((): NotebookState | null => {
    if (redoHistory.length === 0) return null

    const nextState = redoHistory[redoHistory.length - 1]
    const clonedState = deepCloneState(nextState)

    setRedoHistory((prev) => prev.slice(0, -1))
    setUndoHistory((prev) => [...prev, clonedState])

    return clonedState
  }, [redoHistory])

  const canUndo = undoHistory.length > 0
  const canRedo = redoHistory.length > 0

  return {
    saveStateForUndo,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
