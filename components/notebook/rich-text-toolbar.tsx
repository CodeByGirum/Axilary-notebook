"use client"

import type { Editor } from "@tiptap/react"
import { Toolbar } from "@/components/richtext/Toolbar/Toolbar"

interface RichTextToolbarProps {
  editor: Editor
  className?: string
}

export function RichTextToolbar({ editor, className = "" }: RichTextToolbarProps) {
  return <Toolbar editor={editor} className={className} />
}
