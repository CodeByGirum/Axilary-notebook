"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { TextEditorContent, TextEditorConfig, TextEditorCallbacks } from "../types"

interface UseTextEditorCrudProps {
  initialContent?: string
  config?: TextEditorConfig
  callbacks?: TextEditorCallbacks
}

export function useTextEditorCrud({ initialContent = "", config = {}, callbacks = {} }: UseTextEditorCrudProps = {}) {
  const [content, setContent] = useState<TextEditorContent>({
    id: crypto.randomUUID(),
    content: initialContent,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [isDirty, setIsDirty] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const { autoSave = false, autoSaveDelay = 1000 } = config

  const createContent = useCallback(
    (newContent: string, metadata?: Record<string, any>) => {
      const created: TextEditorContent = {
        id: crypto.randomUUID(),
        content: newContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata,
      }
      setContent(created)
      setIsDirty(false)
      callbacks.onCreate?.(created)
      return created
    },
    [callbacks],
  )

  const updateContent = useCallback(
    (newContent: string, metadata?: Record<string, any>) => {
      if (newContent === content.content && !metadata) return content

      const updated: TextEditorContent = {
        ...content,
        content: newContent,
        updatedAt: new Date(),
        metadata: metadata ? { ...content.metadata, ...metadata } : content.metadata,
      }

      setContent(updated)
      setIsDirty(true)

      if (autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          callbacks.onUpdate?.(updated)
          setIsDirty(false)
        }, autoSaveDelay)
      } else {
        callbacks.onUpdate?.(updated)
      }

      return updated
    },
    [content, autoSave, autoSaveDelay, callbacks],
  )

  const deleteContent = useCallback(() => {
    callbacks.onDelete?.(content.id)
    setContent({
      id: crypto.randomUUID(),
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setIsDirty(false)
  }, [content.id, callbacks])

  const saveContent = useCallback(() => {
    if (isDirty) {
      callbacks.onUpdate?.(content)
      setIsDirty(false)
    }
  }, [isDirty, content, callbacks])

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    content,
    isDirty,
    createContent,
    updateContent,
    deleteContent,
    saveContent,
  }
}
