"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { RichTextToolbar } from "./rich-text-toolbar"
import { SelectionContextMenu } from "./selection-context-menu"

export enum TitleSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
}

const getTitleClassName = (size: TitleSize): string => {
  switch (size) {
    case TitleSize.SMALL:
      return "text-2xl font-bold"
    case TitleSize.MEDIUM:
      return "text-3xl font-bold"
    case TitleSize.LARGE:
      return "text-4xl font-bold"
    case TitleSize.XLARGE:
      return "text-5xl font-bold"
    default:
      return "text-4xl font-bold"
  }
}

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  showToolbar?: boolean
  isTitle?: boolean
  titleSize?: TitleSize
  onEmptyBackspace?: () => void
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Type your text here...",
  className,
  readOnly = false,
  showToolbar: forceShowToolbar,
  isTitle = false,
  titleSize = TitleSize.LARGE,
  onEmptyBackspace,
}: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [hasSelection, setHasSelection] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)

  const extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
    }),
  ]

  const handleKeyDown = useCallback(
    (view: any, event: KeyboardEvent) => {
      if (event.key === "Backspace" && view.state.doc.textContent.trim() === "") {
        if (onEmptyBackspace) {
          onEmptyBackspace()
        }
        return true
      }
      return false
    },
    [onEmptyBackspace],
  )

  const handleContextMenu = useCallback((view: any, event: MouseEvent) => {
    const { selection } = view.state
    if (!selection.empty) {
      event.preventDefault()
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        visible: true,
      })
      return true
    }
    return false
  }, [])

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 1000)
    },
    onFocus: () => {
      setIsFocused(true)
      if (!isTitle) {
        setShowToolbar(true)
      }
    },
    onBlur: ({ event }) => {
      const relatedTarget = event.relatedTarget as HTMLElement
      if (relatedTarget && editorRef.current?.contains(relatedTarget)) {
        return
      }
      setIsFocused(false)
      setTimeout(() => {
        setShowToolbar(false)
      }, 100)
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state
      setHasSelection(!selection.empty)
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert prose-sm max-w-none",
          "focus:outline-none cursor-text",
          "caret-white",
          isTitle
            ? "leading-none min-h-[15rem] py-3 px-0 font-bold"
            : "text-base leading-relaxed min-h-[6rem] py-4 px-3",
          !isTitle && "[&_h1]:text-5xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white [&_h1]:leading-tight",
          !isTitle && "[&_h2]:text-[36px] [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:text-white [&_h2]:leading-tight",
          !isTitle && "[&_h3]:text-[28px] [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-white [&_h3]:leading-tight",
          !isTitle && "[&_h4]:text-[22px] [&_h4]:font-medium [&_h4]:mb-1 [&_h4]:text-white [&_h4]:leading-tight",
          "[&_p]:leading-relaxed [&_p]:text-white [&_p]:mb-2",
          "[&_ul]:leading-relaxed [&_ul]:text-white",
          "[&_ol]:leading-relaxed [&_ol]:text-white",
          "[&_li]:leading-relaxed [&_li]:text-white",
          "[&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-neutral-600 [&_blockquote]:pl-4 [&_blockquote]:italic",
          className,
        ),
        style: isTitle
          ? "font-size: 48px !important; line-height: 1 !important; font-weight: bold !important;"
          : undefined,
      },
      handleKeyDown,
      handleDOMEvents: {
        contextmenu: handleContextMenu,
      },
    },
  })

  useEffect(() => {
    if (editor && !readOnly && !content) {
      setTimeout(() => {
        editor.commands.focus()
      }, 100)
    }
  }, [editor, readOnly, content])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowToolbar(false)
        setIsFocused(false)
        setContextMenu((prev) => ({ ...prev, visible: false }))
        editor?.commands.blur()
      }
    }

    const handleGlobalClick = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }))
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("click", handleGlobalClick)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [editor, isFocused, isTitle])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const shouldShowToolbar = !readOnly && !isTitle && (forceShowToolbar || (showToolbar && isFocused))
  const titleClassName = isTitle ? getTitleClassName(titleSize) : ""

  return (
    <div className="space-y-2" ref={editorRef}>
      <style jsx>{`
        .ProseMirror {
          caret-color: white !important;
          user-select: text;
        }
        
        .ProseMirror:focus {
          caret-color: white !important;
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
          titleClassName,
        )}
        onClick={() => {
          if (!readOnly) {
            editor?.commands.focus()
          }
        }}
      >
        <EditorContent editor={editor} className="w-full" />
        {!content && !readOnly && (
          <div
            className={cn(
              "absolute pointer-events-none text-white/40 leading-none",
              isTitle ? `top-3 left-0 ${titleClassName}` : "top-4 left-3 text-base leading-relaxed",
            )}
          >
            {placeholder}
          </div>
        )}
      </div>

      {contextMenu.visible && hasSelection && (
        <SelectionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          editor={editor}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  )
}
