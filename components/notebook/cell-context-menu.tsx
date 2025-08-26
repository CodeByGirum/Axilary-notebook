"use client"

import { useRef, useEffect, useState } from "react"
import { Copy, Scissors, Clipboard, Split, FileText, Code } from "lucide-react"

interface CellContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onSplitCell: () => void
  onConvertToText?: () => void
  onConvertToCode?: () => void
  hasSelection: boolean
  canPaste: boolean
  isTextCell: boolean
}

export function CellContextMenu({
  x,
  y,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onSplitCell,
  onConvertToText,
  onConvertToCode,
  hasSelection,
  canPaste,
  isTextCell,
}: CellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [clipboardAvailable, setClipboardAvailable] = useState(true)

  useEffect(() => {
    navigator.clipboard
      .readText()
      .then(() => setClipboardAvailable(true))
      .catch(() => setClipboardAvailable(false))

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const menuItems = [
    {
      label: "Copy",
      icon: Copy,
      onClick: onCopy,
      disabled: !hasSelection,
    },
    {
      label: "Cut",
      icon: Scissors,
      onClick: onCut,
      disabled: !hasSelection,
    },
    {
      label: "Paste",
      icon: Clipboard,
      onClick: onPaste,
      disabled: !clipboardAvailable,
    },
    {
      label: "Split Cell",
      icon: Split,
      onClick: onSplitCell,
      disabled: false,
    },
    ...(isTextCell && onConvertToCode
      ? [
          {
            label: "Convert to Code Cell",
            icon: Code,
            onClick: onConvertToCode,
            disabled: false,
          },
        ]
      : []),
    ...(!isTextCell && onConvertToText
      ? [
          {
            label: "Convert to Text Cell",
            icon: FileText,
            onClick: onConvertToText,
            disabled: false,
          },
        ]
      : []),
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled) {
              item.onClick()
              onClose()
            }
          }}
          disabled={item.disabled}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
            item.disabled
              ? "text-neutral-500 cursor-not-allowed"
              : "text-neutral-300 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <item.icon className="w-3 h-3" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
