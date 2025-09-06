"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { Plus, Minus, ChevronDown } from "lucide-react"
import { useFontSize } from "./useFontSize"

interface FontSizeInputProps {
  editor: Editor
}

export function FontSizeInput({ editor }: FontSizeInputProps) {
  const [customSize, setCustomSize] = useState("")
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const { getCurrentFontSize, applyFontSize, incrementFontSize, decrementFontSize } = useFontSize(editor)

  const predefinedSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]
  const hasSelection = editor.state.selection.from !== editor.state.selection.to

  const handleIncrement = () => {
    const newSize = incrementFontSize()
    if (newSize) setCustomSize(newSize.toString())
  }

  const handleDecrement = () => {
    const newSize = decrementFontSize()
    if (newSize) setCustomSize(newSize.toString())
  }

  const handleSizeSelect = (size: number) => {
    applyFontSize(size)
    setCustomSize(size.toString())
    setShowSizeDropdown(false)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Numeric input */}
      <input
        type="number"
        min="8"
        max="72"
        value={customSize}
        onChange={(e) => setCustomSize(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && customSize && hasSelection) {
            const size = Number.parseInt(customSize)
            if (size >= 8 && size <= 72) {
              applyFontSize(size)
            }
          }
        }}
        disabled={!hasSelection}
        placeholder={getCurrentFontSize() || "Size"}
        className="w-12 px-1 py-1 text-xs bg-[#2a2a2a] border border-[#3a3a3a] rounded text-[#cccccc] disabled:opacity-50"
        title="Font Size"
      />

      {/* Decrement button */}
      <button
        onClick={handleDecrement}
        disabled={!hasSelection}
        className="p-1 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
        title="Decrease Size"
      >
        <Minus className="w-3 h-3" />
      </button>

      {/* Increment button */}
      <button
        onClick={handleIncrement}
        disabled={!hasSelection}
        className="p-1 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
        title="Increase Size"
      >
        <Plus className="w-3 h-3" />
      </button>

      {/* Size dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSizeDropdown(!showSizeDropdown)}
          disabled={!hasSelection}
          className="p-1 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
          title="Size Presets"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        {showSizeDropdown && hasSelection && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {predefinedSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className="flex items-center justify-between w-full text-left px-3 py-1 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
              >
                <span>{size}px</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
