"use client"

import type { Editor } from "@tiptap/react"
import { Undo, Redo } from "lucide-react"

interface UndoRedoProps {
  editor: Editor
}

export function UndoRedo({ editor }: UndoRedoProps) {
  return (
    <>
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
    </>
  )
}
