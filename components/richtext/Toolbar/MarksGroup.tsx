"use client"

import type { Editor } from "@tiptap/react"
import { Bold, Italic, Underline, Strikethrough, Superscript, Subscript } from "lucide-react"

interface MarksGroupProps {
  editor: Editor
}

export function MarksGroup({ editor }: MarksGroupProps) {
  const marks = [
    { name: "bold", icon: Bold, title: "Bold", command: () => editor.chain().focus().toggleBold().run() },
    { name: "italic", icon: Italic, title: "Italic", command: () => editor.chain().focus().toggleItalic().run() },
    {
      name: "underline",
      icon: Underline,
      title: "Underline",
      command: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "strike",
      icon: Strikethrough,
      title: "Strikethrough",
      command: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "superscript",
      icon: Superscript,
      title: "Superscript",
      command: () => editor.chain().focus().toggleSuperscript().run(),
    },
    {
      name: "subscript",
      icon: Subscript,
      title: "Subscript",
      command: () => editor.chain().focus().toggleSubscript().run(),
    },
  ]

  return (
    <>
      {marks.map((mark) => (
        <button
          key={mark.name}
          onClick={mark.command}
          className={`p-1.5 rounded ${
            editor.isActive(mark.name) ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
          }`}
          title={mark.title}
        >
          <mark.icon className="w-4 h-4" />
        </button>
      ))}
    </>
  )
}
