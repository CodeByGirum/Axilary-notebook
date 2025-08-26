"use client"

import { useState } from "react"
import { Bold, Italic, Underline, Strikethrough, Code, Link, List, ListOrdered, ChevronDown } from "lucide-react"

interface TextEditorToolbarProps {
  onFormat: (format: string, value?: string) => void
  className?: string
}

export function TextEditorToolbar({ onFormat, className = "" }: TextEditorToolbarProps) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false)

  const headingOptions = [
    { label: "Normal Text", value: "p" },
    { label: "Heading 1", value: "h1" },
    { label: "Heading 2", value: "h2" },
    { label: "Heading 3", value: "h3" },
    { label: "Heading 4", value: "h4" },
    { label: "Heading 5", value: "h5" },
    { label: "Heading 6", value: "h6" },
  ]

  return (
    <div className={`flex items-center gap-1 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md ${className}`}>
      {/* Heading Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        >
          Heading 1
          <ChevronDown className="w-3 h-3" />
        </button>
        {showHeadingDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 min-w-[120px]">
            {headingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFormat("heading", option.value)
                  setShowHeadingDropdown(false)
                }}
                className="block w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Formatting Buttons */}
      <button onClick={() => onFormat("bold")} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("italic")}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("underline")}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("strikethrough")}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      <button onClick={() => onFormat("code")} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Code">
        <Code className="w-4 h-4" />
      </button>
      <button onClick={() => onFormat("link")} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Link">
        <Link className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      <button
        onClick={() => onFormat("bulletList")}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("numberedList")}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  )
}
