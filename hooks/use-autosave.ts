"use client"

import { useCallback, useRef, useEffect } from "react"

interface AutosaveOptions {
  delay?: number
  onSave: (data: any) => Promise<void>
}

export function useAutosave<T>(data: T, options: AutosaveOptions) {
  const { delay = 1000, onSave } = options
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousDataRef = useRef<T>(data)
  const isSavingRef = useRef(false)

  const debouncedSave = useCallback(
    async (currentData: T) => {
      if (isSavingRef.current) return

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(async () => {
        try {
          isSavingRef.current = true
          await onSave(currentData)
          console.log("[v0] Autosaved successfully")
        } catch (error) {
          console.error("[v0] Autosave failed:", error)
        } finally {
          isSavingRef.current = false
        }
      }, delay)
    },
    [onSave, delay],
  )

  useEffect(() => {
    // Only trigger save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      debouncedSave(data)
      previousDataRef.current = data
    }
  }, [data, debouncedSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving: isSavingRef.current,
    forceSave: () => debouncedSave(data),
  }
}
