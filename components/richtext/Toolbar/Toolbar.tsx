"use client"

import type { Editor } from "@tiptap/react"
import { Code, Highlighter, List, ListOrdered, CheckSquare, Quote } from "lucide-react"
import { UndoRedo } from "./UndoRedo"
import { FontSizeInput } from "./FontSizeInput"
import { HeadingDropdown } from "./HeadingDropdown"
import { MarksGroup } from "./MarksGroup"
import { AlignDropdown } from "./AlignDropdown"
import { LinkImageTable } from "./LinkImageTable"

interface ToolbarProps {
  editor: Editor
  className?: string
}

export function Toolbar({ editor, className = "" }: ToolbarProps) {
  return (
    <div
      className={`flex items-center gap-1 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md flex-wrap ${className}`}
    >
      {/* Undo/Redo */}
      <UndoRedo editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Font Size Controls */}
      <FontSizeInput editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Heading Dropdown */}
      <HeadingDropdown editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Basic Formatting */}
      <MarksGroup editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Text Alignment */}
      <AlignDropdown editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Inline Features */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded ${
          editor.isActive("code") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 rounded ${
          editor.isActive("highlight") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <LinkImageTable editor={editor} />

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${
          editor.isActive("bulletList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${
          editor.isActive("orderedList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded ${
          editor.isActive("taskList") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-[#2a2a2a]" />

      {/* Structural Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded ${
          editor.isActive("blockquote") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  )
}
