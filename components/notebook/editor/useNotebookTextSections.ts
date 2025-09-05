"use client"

import { useCallback } from "react"
import type { TextSectionData } from "./NotebookItems"
import { generateId } from "./NotebookItems"

interface UseNotebookTextSectionsProps {
  textSections: TextSectionData[]
  nextOrder: number
  onTextSectionsChange: (textSections: TextSectionData[]) => void
  onOrderChange: (newOrder: number) => void
}

export function useNotebookTextSections({
  textSections,
  nextOrder,
  onTextSectionsChange,
  onOrderChange,
}: UseNotebookTextSectionsProps) {
  const addTextSection = useCallback(
    (afterId?: string) => {
      const newTextSection: TextSectionData = {
        id: generateId(),
        content: "",
        order: nextOrder,
      }

      onTextSectionsChange([...textSections, newTextSection])
      onOrderChange(nextOrder + 1)

      // Focus the new text section
      setTimeout(() => {
        const element = document.getElementById(`text-section-${newTextSection.id}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          const textarea = element.querySelector("textarea")
          if (textarea) {
            textarea.focus()
          }
        }
      }, 100)
    },
    [textSections, nextOrder, onTextSectionsChange, onOrderChange],
  )

  const updateTextSection = useCallback(
    (id: string, content: string) => {
      onTextSectionsChange(textSections.map((section) => (section.id === id ? { ...section, content } : section)))
    },
    [textSections, onTextSectionsChange],
  )

  const deleteTextSection = useCallback(
    (id: string) => {
      onTextSectionsChange(textSections.filter((section) => section.id !== id))
    },
    [textSections, onTextSectionsChange],
  )

  const duplicateTextSection = useCallback(
    (id: string) => {
      const section = textSections.find((s) => s.id === id)
      if (!section) return

      const duplicate: TextSectionData = {
        ...section,
        id: generateId(),
        order: nextOrder,
      }

      onTextSectionsChange([...textSections, duplicate])
      onOrderChange(nextOrder + 1)

      // Focus the duplicated text section
      setTimeout(() => {
        const element = document.getElementById(`text-section-${duplicate.id}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    },
    [textSections, nextOrder, onTextSectionsChange, onOrderChange],
  )

  const toggleTextSectionLock = useCallback(
    (id: string) => {
      onTextSectionsChange(
        textSections.map((section) => (section.id === id ? { ...section, isLocked: !section.isLocked } : section)),
      )
    },
    [textSections, onTextSectionsChange],
  )

  return {
    addTextSection,
    updateTextSection,
    deleteTextSection,
    duplicateTextSection,
    toggleTextSectionLock,
  }
}
