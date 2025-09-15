"use client"

import { useState, useEffect, useCallback } from "react"

interface NotebookListItem {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  isHidden?: boolean
}

export function useNotebookList() {
  const [notebooks, setNotebooks] = useState<NotebookListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notebooks from localStorage (simulating API call)
  const loadNotebooks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // For now, load from localStorage until backend is connected
      const savedNotebooks = localStorage.getItem("user-notebooks")
      if (savedNotebooks) {
        const parsed = JSON.parse(savedNotebooks)
        setNotebooks(parsed)
        console.log("[v0] Loaded", parsed.length, "notebooks from storage")
      }
    } catch (err) {
      console.error("[v0] Failed to load notebooks:", err)
      setError("Failed to load notebooks")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new notebook
  const createNotebook = useCallback(
    async (title?: string): Promise<NotebookListItem | null> => {
      try {
        const newNotebook: NotebookListItem = {
          id: `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title || `Untitled Notebook ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isHidden: false, // New notebooks start visible
        }

        const updatedNotebooks = [newNotebook, ...notebooks]
        setNotebooks(updatedNotebooks)

        // Save to localStorage
        localStorage.setItem("user-notebooks", JSON.stringify(updatedNotebooks))
        console.log("[v0] Created new notebook:", newNotebook.title)

        return newNotebook
      } catch (err) {
        console.error("[v0] Failed to create notebook:", err)
        setError("Failed to create notebook")
        return null
      }
    },
    [notebooks],
  )

  // Toggle notebook visibility
  const toggleNotebookVisibility = useCallback(
    (notebookId: string) => {
      const updatedNotebooks = notebooks.map((notebook) =>
        notebook.id === notebookId ? { ...notebook, isHidden: !notebook.isHidden } : notebook,
      )
      setNotebooks(updatedNotebooks)
      localStorage.setItem("user-notebooks", JSON.stringify(updatedNotebooks))
      console.log("[v0] Toggled visibility for notebook:", notebookId)
    },
    [notebooks],
  )

  // Delete notebook
  const deleteNotebook = useCallback(
    (notebookId: string) => {
      const updatedNotebooks = notebooks.filter((notebook) => notebook.id !== notebookId)
      setNotebooks(updatedNotebooks)
      localStorage.setItem("user-notebooks", JSON.stringify(updatedNotebooks))
      console.log("[v0] Deleted notebook:", notebookId)
    },
    [notebooks],
  )

  // Get visible notebooks only
  const visibleNotebooks = notebooks.filter((notebook) => !notebook.isHidden)

  // Get hidden notebooks only
  const hiddenNotebooks = notebooks.filter((notebook) => notebook.isHidden)

  // Load notebooks on mount
  useEffect(() => {
    loadNotebooks()
  }, [loadNotebooks])

  return {
    notebooks,
    visibleNotebooks,
    hiddenNotebooks,
    isLoading,
    error,
    createNotebook,
    toggleNotebookVisibility,
    deleteNotebook,
    loadNotebooks,
  }
}
