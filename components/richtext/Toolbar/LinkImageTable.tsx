"use client"

import type { Editor } from "@tiptap/react"
import { Link, ImageIcon, Table } from "lucide-react"

interface LinkImageTableProps {
  editor: Editor
}

export function LinkImageTable({ editor }: LinkImageTableProps) {
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

  return (
    <>
      <button
        onClick={setLink}
        className={`p-1.5 rounded ${
          editor.isActive("link") ? "bg-[#2a2a2a] text-white" : "text-[#cccccc] hover:bg-[#2a2a2a]"
        }`}
        title="Link"
      >
        <Link className="w-4 h-4" />
      </button>
      <button onClick={addImage} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Image">
        <ImageIcon className="w-4 h-4" />
      </button>
      <button onClick={insertTable} className="p-1.5 text-[#cccccc] hover:bg-[#2a2a2a] rounded" title="Table">
        <Table className="w-4 h-4" />
      </button>
    </>
  )
}
