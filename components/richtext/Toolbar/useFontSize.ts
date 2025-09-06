"use client"

import type { Editor } from "@tiptap/react"

export function useFontSize(editor: Editor) {
  const getCurrentFontSize = () => {
    const { from, to } = editor.state.selection
    if (from === to) return "" // No selection

    const doc = editor.state.doc
    const sizes = new Set<string>()

    doc.nodesBetween(from, to, (node) => {
      if (node.isText && node.marks) {
        const textStyleMark = node.marks.find((mark) => mark.type.name === "textStyle")
        if (textStyleMark && textStyleMark.attrs.fontSize) {
          // Extract numeric value from fontSize (e.g., "16px" -> "16")
          const size = textStyleMark.attrs.fontSize.replace("px", "")
          sizes.add(size)
        } else {
          sizes.add("16") // default size
        }
      }
    })

    return sizes.size > 1 ? "Mixed" : Array.from(sizes)[0] || ""
  }

  const applyFontSize = (size: number) => {
    const { from, to } = editor.state.selection
    if (from === to) return // No selection

    try {
      const success = editor
        .chain()
        .focus()
        .updateAttributes("textStyle", { fontSize: `${size}px` })
        .run()

      if (!success) {
        editor
          .chain()
          .focus()
          .setMark("textStyle", { fontSize: `${size}px` })
          .run()
      }
    } catch (error) {
      console.error("Font size application error:", error)
    }
  }

  const incrementFontSize = () => {
    const currentSize = getCurrentFontSize()
    if (currentSize && currentSize !== "Mixed") {
      const newSize = Math.min(Number.parseInt(currentSize) + 2, 72)
      applyFontSize(newSize)
      return newSize
    }
    return null
  }

  const decrementFontSize = () => {
    const currentSize = getCurrentFontSize()
    if (currentSize && currentSize !== "Mixed") {
      const newSize = Math.max(Number.parseInt(currentSize) - 2, 8)
      applyFontSize(newSize)
      return newSize
    }
    return null
  }

  return {
    getCurrentFontSize,
    applyFontSize,
    incrementFontSize,
    decrementFontSize,
  }
}
