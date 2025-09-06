"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

interface NotebookTitleProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export function NotebookTitle({
  value,
  onChange,
  placeholder = "Untitled",
  readOnly = false,
  className,
}: NotebookTitleProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      onChange(content)
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none focus:outline-none",
          "text-4xl font-bold text-white leading-tight",
          "min-h-[3rem] py-3 px-0",
          "caret-white",
          className,
        ),
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          return true
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  useEffect(() => {
    if (editor && !readOnly && !value) {
      setTimeout(() => editor.commands.focus(), 100)
    }
  }, [editor, readOnly, value])

  if (!editor) return null

  return (
    <div className="mb-8">
      <style jsx>{`
        .ProseMirror {
          caret-color: white !important;
        }
        
        .ProseMirror.is-editor-empty::before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
          position: absolute;
        }
      `}</style>

      <div
        className={cn(
          "w-full cursor-text rounded-md transition-colors",
          !readOnly && "hover:bg-white/[0.02]",
          readOnly && "cursor-default",
        )}
        onClick={() => !readOnly && editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
