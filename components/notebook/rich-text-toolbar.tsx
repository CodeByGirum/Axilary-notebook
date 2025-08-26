"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Superscript,
  Subscript,
  Highlighter,
  Quote,
  ImageIcon,
  Table,
  CheckSquare,
  Undo,
  Redo,
  Plus,
  Minus,
} from "lucide-react"

interface RichTextToolbarProps {
  editor: Editor
  className?: string
}

export function RichTextToolbar({ editor, className = "" }: RichTextToolbarProps) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false)
  const [showAlignDropdown, setShowAlignDropdown] = useState(false)
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const [customSize, setCustomSize] = useState("")

  const headingOptions = [
    { label: "Normal Text", value: "paragraph", size: "16px" },
    { label: "Title (H1)", value: "h1", size: "48px", disabled: false },
    { label: "Heading 2", value: "h2", size: "36px", disabled: false },
    { label: "Heading 3", value: "h3", size: "28px", disabled: false },
    { label: "Heading 4", value: "h4", size: "22px", disabled: false },
  ]

  const predefinedSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "Title (H1)"
    if (editor.isActive("heading", { level: 2 })) return "Heading 2"
    if (editor.isActive("heading", { level: 3 })) return "Heading 3"
    if (editor.isActive("heading", { level: 4 })) return "Heading 4"
    return "Normal Text"
  }

  const getCurrentFontSize = () => {
    const { from, to } = editor.state.selection
    if (from === to) return "" // No selection

    console.log("[v0] Getting current font size for selection:", { from, to })

    const doc = editor.state.doc
    const sizes = new Set<string>()

    doc.nodesBetween(from, to, (node) => {
      if (node.isText && node.marks) {
        const textStyleMark = node.marks.find((mark) => mark.type.name === "textStyle")
        if (textStyleMark && textStyleMark.attrs.fontSize) {
          // Extract numeric value from fontSize (e.g., "16px" -> "16")
          const size = textStyleMark.attrs.fontSize.replace("px", "")
          sizes.add(size)
          console.log("[v0] Found fontSize in mark:", size)
        } else {
          sizes.add("16") // default size updated to 16px
          console.log("[v0] No fontSize found, using default: 16")
        }
      }
    })

    const result = sizes.size > 1 ? "Mixed" : Array.from(sizes)[0] || ""
    console.log("[v0] Current font size result:", result)
    return result
  }

  const applyFontSize = (size: number) => {
    const { from, to } = editor.state.selection
    if (from === to) {
      console.log("[v0] No selection, cannot apply font size")
      return // No selection
    }

    console.log("[v0] Applying font size:", size, "to selection:", { from, to })

    try {
      const success = editor
        .chain()
        .focus()
        .updateAttributes("textStyle", { fontSize: `${size}px` })
        .run()

      console.log("[v0] Font size application success:", success)

      if (!success) {
        console.log("[v0] Trying alternative font size application method")
        editor
          .chain()
          .focus()
          .setMark("textStyle", { fontSize: `${size}px` })
          .run()
      }
    } catch (error) {
      console.log("[v0] Font size application error:", error)
    }
  }

  const incrementFontSize = () => {
    console.log("[v0] Increment font size clicked")
    const currentSize = getCurrentFontSize()
    console.log("[v0] Current size for increment:", currentSize)
    if (currentSize && currentSize !== "Mixed") {
      const newSize = Math.min(Number.parseInt(currentSize) + 2, 72)
      console.log("[v0] New incremented size:", newSize)
      applyFontSize(newSize)
      setCustomSize(newSize.toString())
    }
  }

  const decrementFontSize = () => {
    console.log("[v0] Decrement font size clicked")
    const currentSize = getCurrentFontSize()
    console.log("[v0] Current size for decrement:", currentSize)
    if (currentSize && currentSize !== "Mixed") {
      const newSize = Math.max(Number.parseInt(currentSize) - 2, 8)
      console.log("[v0] New decremented size:", newSize)
      applyFontSize(newSize)
      setCustomSize(newSize.toString())
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt("Image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const hasSelection = editor.state.selection.from !== editor.state.selection.to

  return (
    <div
      className={`flex items-center gap-1 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md flex-wrap ${className}`}
    >
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      <div className="flex items-center gap-1">
        {/* Numeric input */}
        <input
          type="number"
          min="8"
          max="72"
          value={customSize}
          onChange={(e) => {
            console.log("[v0] Font size input changed:", e.target.value)
            setCustomSize(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customSize && hasSelection) {
              console.log("[v0] Enter pressed with font size:", customSize)
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
          onClick={decrementFontSize}
          disabled={!hasSelection}
          className="p-1 text-[#cccccc] hover:bg-[#2a2a2a] rounded disabled:opacity-50"
          title="Decrease Size"
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* Increment button */}
        <button
          onClick={incrementFontSize}
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
                  onClick={() => {
                    console.log("[v0] Preset size clicked:", size)
                    applyFontSize(size)
                    setCustomSize(size.toString())
                    setShowSizeDropdown(false)
                  }}
                  className="flex items-center justify-between w-full text-left px-3 py-1 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
                >
                  <span>{size}px</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Heading Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-[#cccccc] hover:bg-[#2a2a2a] rounded"
        >
          {getCurrentHeading()}
          <ChevronDown className="w-3 h-3" />
        </button>
        {showHeadingDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10 min-w-[140px]">
            {headingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value === "paragraph") {
                    editor.chain().focus().setParagraph().run()
                  } else {
                    const level = Number.parseInt(option.value.replace("h", ""))
                    editor.chain().focus().toggleHeading({ level }).run()
                  }
                  setShowHeadingDropdown(false)
                }}
                className="flex items-center justify-between w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
              >
                <span>{option.label}</span>
                <span className="text-xs text-neutral-500">{option.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Basic Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded ${editor.isActive("underline") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded ${editor.isActive("strike") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-1.5 rounded ${editor.isActive("superscript") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Superscript"
      >
        <Superscript className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-1.5 rounded ${editor.isActive("subscript") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Subscript"
      >
        <Subscript className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Text Alignment */}
      <div className="relative">
        <button
          onClick={() => setShowAlignDropdown(!showAlignDropdown)}
          className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded"
          title="Text Alignment"
        >
          {editor.isActive({ textAlign: "center" }) ? (
            <AlignCenter className="w-4 h-4" />
          ) : editor.isActive({ textAlign: "right" }) ? (
            <AlignRight className="w-4 h-4" />
          ) : editor.isActive({ textAlign: "justify" }) ? (
            <AlignJustify className="w-4 h-4" />
          ) : (
            <AlignLeft className="w-4 h-4" />
          )}
        </button>
        {showAlignDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-10">
            <button
              onClick={() => {
                editor.chain().focus().setTextAlign("left").run()
                setShowAlignDropdown(false)
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <AlignLeft className="w-4 h-4" />
              Left
            </button>
            <button
              onClick={() => {
                editor.chain().focus().setTextAlign("center").run()
                setShowAlignDropdown(false)
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <AlignCenter className="w-4 h-4" />
              Center
            </button>
            <button
              onClick={() => {
                editor.chain().focus().setTextAlign("right").run()
                setShowAlignDropdown(false)
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <AlignRight className="w-4 h-4" />
              Right
            </button>
            <button
              onClick={() => {
                editor.chain().focus().setTextAlign("justify").run()
                setShowAlignDropdown(false)
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#cccccc] hover:bg-[#2a2a2a]"
            >
              <AlignJustify className="w-4 h-4" />
              Justify
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Inline Features */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded ${editor.isActive("code") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 rounded ${editor.isActive("highlight") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </button>
      <button
        onClick={setLink}
        className={`p-1.5 rounded ${editor.isActive("link") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Link"
      >
        <Link className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded ${editor.isActive("taskList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Structural Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded ${editor.isActive("blockquote") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"}`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button onClick={addImage} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Image">
        <ImageIcon className="w-4 h-4" />
      </button>
      <button onClick={insertTable} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Table">
        <Table className="w-4 h-4" />
      </button>
    </div>
  )
}
