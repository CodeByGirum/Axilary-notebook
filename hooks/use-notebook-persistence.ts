"use client"

import { useCallback, useEffect, useState } from "react"
import { notebookAPI } from "@/lib/notebook-api"
import type { NotebookData, NotebookCellData } from "@/types/notebook"

interface NotebookPersistenceOptions {
  notebookId?: string
  autoSave?: boolean
  onError?: (error: Error) => void
}

export function useNotebookPersistence(options: NotebookPersistenceOptions = {}) {
  const { notebookId, autoSave = true, onError } = options
  const [isLoading, setIsLoading] = useState(false)
  const [notebook, setNotebook] = useState<NotebookData | null>(null)

  // Load notebook from database
  const loadNotebook = useCallback(
    async (id: string) => {
      if (!id) return null

      try {
        setIsLoading(true)
        const data = await notebookAPI.getNotebook(id)
        setNotebook(data)
        console.log("[v0] Loaded notebook from database:", data.title)
        return data
      } catch (error) {
        console.error("[v0] Failed to load notebook:", error)
        onError?.(error as Error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [onError],
  )

  // Save notebook data
  const saveNotebook = useCallback(
    async (data: Partial<NotebookData>) => {
      if (!notebookId) return

      try {
        const updated = await notebookAPI.updateNotebook(notebookId, data)
        setNotebook(updated)
        return updated
      } catch (error) {
        console.error("[v0] Failed to save notebook:", error)
        onError?.(error as Error)
        throw error
      }
    },
    [notebookId, onError],
  )

  // Save individual cell
  const saveCell = useCallback(
    async (cell: NotebookCellData) => {
      if (!notebookId) return cell

      try {
        const updated = await notebookAPI.saveCell(notebookId, cell)
        console.log("[v0] Saved cell to database:", cell.id)
        return updated
      } catch (error) {
        console.error("[v0] Failed to save cell:", error)
        onError?.(error as Error)
        throw error
      }
    },
    [notebookId, onError],
  )

  // Save multiple cells (batch)
  const saveCells = useCallback(
    async (cells: NotebookCellData[]) => {
      if (!notebookId || cells.length === 0) return cells

      try {
        const updated = await notebookAPI.saveCells(notebookId, cells)
        console.log("[v0] Saved", cells.length, "cells to database")
        return updated
      } catch (error) {
        console.error("[v0] Failed to save cells:", error)
        onError?.(error as Error)
        throw error
      }
    },
    [notebookId, onError],
  )

  // Auto-load notebook on mount
  useEffect(() => {
    if (notebookId && !notebook) {
      loadNotebook(notebookId)
    }
  }, [notebookId, notebook, loadNotebook])

  return {
    notebook,
    isLoading,
    loadNotebook,
    saveNotebook,
    saveCell,
    saveCells,
  }
}
