"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"

interface AlignDropdownProps {
  editor: Editor
}

export function AlignDropdown({ editor }: AlignDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const getCurrentAlignIcon = () => {
    if (editor.isActive({ textAlign: "center" })) return <AlignCenter className="w-4 h-4" />
    if (editor.isActive({ textAlign: "right" })) return <AlignRight className="w-4 h-4" />
    if (editor.isActive({ textAlign: "justify" })) return <AlignJustify className="w-4 h-4" />
    return <AlignLeft className="w-4 h-4" />
  }

  const alignOptions = [
    { icon: AlignLeft, label: "Left", value: "left" },
    { icon: AlignCenter, label: "Center", value: "center" },
    { icon: AlignRight, label: "Right", value: "right" },
    { icon: AlignJustify, label: "Justify", value: "justify" },
  ]

  const handleAlignSelect = (value: string) => {
    editor.chain().focus().setTextAlign(value).run()
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Text Alignment"
      >
        {getCurrentAlignIcon()}
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10">
          {alignOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAlignSelect(option.value)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
