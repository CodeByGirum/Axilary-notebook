"use client"

import type { Editor } from "@tiptap/react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Copy, Scissors, Link, Bold, Italic, UnderlineIcon } from "lucide-react"

interface SelectionContextMenuProps {
  x: number
  y: number
  editor: Editor
  onClose: () => void
}

export function SelectionContextMenu({ x, y, editor, onClose }: SelectionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleCopy = () => {
    document.execCommand("copy")
    onClose()
  }

  const handleCut = () => {
    document.execCommand("cut")
    onClose()
  }

  const handleBold = () => {
    editor.chain().focus().toggleBold().run()
    onClose()
  }

  const handleItalic = () => {
    editor.chain().focus().toggleItalic().run()
    onClose()
  }

  const handleUnderline = () => {
    editor.chain().focus().toggleUnderline().run()
    onClose()
  }

  const handleLink = () => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl",
        "min-w-[200px] py-2 animate-in fade-in-0 zoom-in-95",
      )}
      style={{ left: x, top: y }}
    >
      <div className="flex flex-col">
        <button
          onClick={handleCopy}
          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
        <button
          onClick={handleCut}
          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors"
        >
          <Scissors className="w-4 h-4" />
          Cut
        </button>
        <div className="h-px bg-neutral-700 my-1" />
        <button
          onClick={handleBold}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors",
            editor.isActive("bold") && "bg-neutral-800",
          )}
        >
          <Bold className="w-4 h-4" />
          Bold
        </button>
        <button
          onClick={handleItalic}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors",
            editor.isActive("italic") && "bg-neutral-800",
          )}
        >
          <Italic className="w-4 h-4" />
          Italic
        </button>
        <button
          onClick={handleUnderline}
          className={cn(
            "flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors",
            editor.isActive("underline") && "bg-neutral-800",
          )}
        >
          <UnderlineIcon className="w-4 h-4" />
          Underline
        </button>
        <div className="h-px bg-neutral-700 my-1" />
        <button
          onClick={handleLink}
          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors"
        >
          <Link className="w-4 h-4" />
          Insert Link
        </button>
      </div>
    </div>
  )
}
