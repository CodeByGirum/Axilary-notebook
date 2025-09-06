"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { ChevronDown } from "lucide-react"

interface HeadingDropdownProps {
  editor: Editor
}

export function HeadingDropdown({ editor }: HeadingDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const headingOptions = [
    { label: "Normal Text", value: "paragraph", size: "16px" },
    { label: "Title (H1)", value: "h1", size: "48px" },
    { label: "Heading 2", value: "h2", size: "36px" },
    { label: "Heading 3", value: "h3", size: "28px" },
    { label: "Heading 4", value: "h4", size: "22px" },
  ]

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "Title (H1)"
    if (editor.isActive("heading", { level: 2 })) return "Heading 2"
    if (editor.isActive("heading", { level: 3 })) return "Heading 3"
    if (editor.isActive("heading", { level: 4 })) return "Heading 4"
    return "Normal Text"
  }

  const handleHeadingSelect = (option: (typeof headingOptions)[0]) => {
    if (option.value === "paragraph") {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = Number.parseInt(option.value.replace("h", ""))
      editor.chain().focus().toggleHeading({ level }).run()
    }
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1 px-3 py-1 text-sm text-[#cccccc] hover:bg-[#2a2a2a] rounded"
      >
        {getCurrentHeading()}
        <ChevronDown className="w-3 h-3" />
      </button>
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 min-w-[140px]">
          {headingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleHeadingSelect(option)}
              className="flex items-center justify-between w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <span>{option.label}</span>
              <span className="text-xs text-neutral-500">{option.size}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
