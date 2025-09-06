"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { RichTextToolbar } from "@/components/notebook/rich-text-toolbar"
import { useTextEditorCrud } from "./hooks/use-text-editor-crud"
import { useEditorState } from "./hooks/use-editor-state"
import { useEditorExtensions } from "./hooks/use-editor-extensions"
import type { TextEditorConfig, TextEditorCallbacks } from "./types"

interface TextEditorProps {
  initialContent?: string
  config?: TextEditorConfig
  callbacks?: TextEditorCallbacks
  className?: string
}

export function TextEditor({ initialContent = "", config = {}, callbacks = {}, className }: TextEditorProps) {
  const {
    placeholder = "Type your text here...",
    readOnly = false,
    showToolbar: forceShowToolbar,
    isTitle = false,
    titleSize = "large",
  } = config

  const editorRef = useRef<HTMLDivElement>(null)
  const extensions = useEditorExtensions()

  const { content, updateContent, deleteContent } = useTextEditorCrud({
    initialContent,
    config,
    callbacks,
  })

  const { isFocused, showToolbar, hasSelection, isTyping, setFocused, setSelection, setTyping } =
    useEditorState(isTitle)

  const handleKeyDown = (view: any, event: KeyboardEvent) => {
    if (event.key === "Backspace" && view.state.doc.textContent.trim() === "") {
      callbacks.onEmptyBackspace?.()
      return true
    }
    return false
  }

  const editor = useEditor({
    extensions,
    content: content.content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      updateContent(editor.getHTML())
      setTyping(true)
    },
    onFocus: () => {
      setFocused(true)
    },
    onBlur: ({ event }) => {
      const relatedTarget = event.relatedTarget as HTMLElement
      if (relatedTarget && editorRef.current?.contains(relatedTarget)) {
        return
      }
      setFocused(false)
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state
      setSelection(!selection.empty)
      if (!selection.empty) {
        setTyping(true, 300)
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert prose-sm max-w-none focus:outline-none cursor-text",
          "caret-white",
          isTitle
            ? "leading-none min-h-[3rem] py-3 px-0 font-bold text-4xl"
            : "text-base leading-relaxed min-h-[6rem] py-4 px-3",
          !isTitle && "[&_h1]:text-5xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white",
          !isTitle && "[&_h2]:text-4xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:text-white",
          !isTitle && "[&_h3]:text-3xl [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-white",
          !isTitle && "[&_h4]:text-2xl [&_h4]:font-medium [&_h4]:mb-1 [&_h4]:text-white",
          "[&_p]:leading-relaxed [&_p]:text-white [&_p]:mb-2",
          "[&_ul]:leading-relaxed [&_ul]:text-white",
          "[&_ol]:leading-relaxed [&_ol]:text-white",
          "[&_li]:leading-relaxed [&_li]:text-white",
          "[&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-neutral-600 [&_blockquote]:pl-4",
          className,
        ),
      },
      handleKeyDown,
    },
  })

  useEffect(() => {
    if (editor && !readOnly && !content.content) {
      setTimeout(() => editor.commands.focus(), 100)
    }
  }, [editor, readOnly, content.content])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setFocused(false)
        editor?.commands.blur()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [editor, setFocused])

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent)
    }
  }, [initialContent, editor])

  if (!editor) return null

  const shouldShowToolbar = !readOnly && !isTitle && (forceShowToolbar || (showToolbar && isFocused))

  const titleSizeMap = {
    small: "text-2xl",
    medium: "text-3xl",
    large: "text-4xl",
    extraLarge: "text-5xl",
  }

  return (
    <div className="space-y-2" ref={editorRef}>
      <style jsx>{`
        .ProseMirror {
          caret-color: white !important;
          user-select: text;
        }
        
        .ProseMirror:focus {
          caret-color: white !important;
          animation: ${isTyping || hasSelection ? "none" : "cursor-blink 1.2s infinite"};
        }
        
        @keyframes cursor-blink {
          0%, 50% { caret-color: white; }
          51%, 100% { caret-color: transparent; }
        }
        
        .ProseMirror ::selection {
          background-color: rgba(59, 130, 246, 0.4) !important;
          color: white !important;
        }
      `}</style>

      {shouldShowToolbar && <RichTextToolbar editor={editor} />}

      <div
        className={cn(
          "w-full cursor-text relative border border-transparent rounded-md transition-colors",
          isFocused && !readOnly && "border-blue-500/30 bg-white/[0.02]",
          readOnly && "cursor-default",
          isTitle && `font-bold ${titleSizeMap[titleSize]}`,
        )}
        onClick={() => !readOnly && editor?.commands.focus()}
      >
        <EditorContent editor={editor} className="w-full" />

        {!content.content && !readOnly && (
          <div
            className={cn(
              "absolute pointer-events-none text-white/40 leading-none",
              isTitle ? `top-3 left-0 font-bold ${titleSizeMap[titleSize]}` : "top-4 left-3 text-base",
            )}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

export default TextEditor
