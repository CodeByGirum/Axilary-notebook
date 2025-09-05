"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { RichTextToolbar } from "./rich-text-toolbar"
import { SelectionContextMenu } from "./selection-context-menu"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Extension } from "@tiptap/core"

/**
 * Title size enumeration for consistent sizing
 */
export enum TitleSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extraLarge",
}

const titleSizeClassNames: Record<TitleSize, string> = {
  [TitleSize.SMALL]: "text-2xl font-semibold leading-tight",
  [TitleSize.MEDIUM]: "text-3xl font-bold leading-tight",
  [TitleSize.LARGE]: "text-4xl font-bold leading-none",
  [TitleSize.EXTRA_LARGE]: "text-5xl font-bold leading-none",
}

function getTitleClassName(size: TitleSize): string {
  return titleSizeClassNames[size] || titleSizeClassNames[TitleSize.LARGE]
}

/**
 * Extension to prevent nested marks for cleaner formatting
 */
const NoNestedMarks = Extension.create({
  name: "noNestedMarks",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          preventNesting: {
            default: true,
            parseHTML: () => true,
            renderHTML: () => ({}),
          },
        },
      },
    ]
  },
})

/**
 * Extension to sanitize pasted content
 */
const PasteSanitizer = Extension.create({
  name: "pasteSanitizer",

  addProseMirrorPlugins() {
    return []
  },
})

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
  const [multiSelections, setMultiSelections] = useState<Array<{ from: number; to: number }>>([])
  const [selectionState, setSelectionState] = useState({
    isDragging: false,
    dragStartPos: null as number | null,
    dragDeleteMode: false,
    selectionDirection: "forward" as "forward" | "backward",
    wordBoundarySnap: false,
    lastDragPos: null as number | null,
    clickCount: 0,
    lastClickTime: 0,
  })

  const editorRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const setTypingState = useCallback((typing: boolean, delay = 1000) => {
    setIsTyping(typing)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), delay)
    }
  }, [])

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      TextStyle.configure({
        HTMLAttributes: { class: "text-style" },
      }),
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      NoNestedMarks,
      PasteSanitizer,
    ],
    [],
  )

  const findWordBoundary = useCallback((doc: any, pos: number, direction: "start" | "end") => {
    const docSize = doc.content.size
    const safePos = Math.max(0, Math.min(pos, docSize))

    try {
      const $pos = doc.resolve(safePos)
      const text = $pos.parent.textContent || ""
      const offset = $pos.textOffset || 0

      if (direction === "start") {
        let start = offset
        while (start > 0 && /\w/.test(text[start - 1])) {
          start--
        }
        const result = $pos.pos - offset + start
        return Math.max(0, Math.min(result, docSize))
      } else {
        let end = offset
        while (end < text.length && /\w/.test(text[end])) {
          end++
        }
        const result = $pos.pos - offset + end
        return Math.max(0, Math.min(result, docSize))
      }
    } catch (error) {
      console.warn("[v0] Position resolve failed, returning safe position:", error)
      return Math.max(0, Math.min(safePos, docSize))
    }
  }, [])

  const handleKeyDown = useCallback(
    (view: any, event: KeyboardEvent) => {
      if (event.key === "Home") {
        const { selection } = view.state
        const $pos = view.state.doc.resolve(selection.from)
        const lineStart = $pos.pos - $pos.textOffset

        if (event.shiftKey) {
          view.dispatch(
            view.state.tr.setSelection(
              view.state.selection.constructor.create(view.state.doc, lineStart, selection.to),
            ),
          )
        } else {
          view.dispatch(
            view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(lineStart))),
          )
        }
        return true
      }

      if (event.key === "End") {
        const { selection } = view.state
        const $pos = view.state.doc.resolve(selection.to)
        const lineEnd = $pos.pos + ($pos.parent.textContent.length - $pos.textOffset)

        if (event.shiftKey) {
          view.dispatch(
            view.state.tr.setSelection(
              view.state.selection.constructor.create(view.state.doc, selection.from, lineEnd),
            ),
          )
        } else {
          view.dispatch(
            view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(lineEnd))),
          )
        }
        return true
      }

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

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: cn(
          "prose prose-invert prose-sm max-w-none",
          "focus:outline-none cursor-text",
          "caret-white caret-cursor-blink",
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
      handleKeyDown: handleKeyDown,
      handleDOMEvents: {
        contextmenu: handleContextMenu,
      },
    }),
    [isTitle, className, handleKeyDown, handleContextMenu],
  )

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setTypingState(true)
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
      if (!selection.empty) {
        setTypingState(true, 300)
      }
    },
    editorProps,
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

    const handleMouseMove = (event: MouseEvent) => {
      if (editorRef.current && editorRef.current.contains(event.target as Node) && isFocused && !isTitle) {
        setShowToolbar(true)
      }
    }

    const handleGlobalClick = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }))
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleGlobalClick)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [editor, isFocused, isTitle])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  if (!editor) {
    return null
  }

  const shouldShowToolbar = !readOnly && !isTitle && (forceShowToolbar || (showToolbar && isFocused))
  const titleClassName = isTitle ? getTitleClassName(titleSize) : ""

  return (
    <div className="space-y-2" ref={editorRef}>
      <style jsx>{`
        .caret-cursor-blink {
          caret-color: white;
        }
        
        .caret-cursor-blink:focus {
          animation: ${isTyping || hasSelection ? "none" : "cursor-blink 1.2s infinite"};
        }
        
        @keyframes cursor-blink {
          0%, 50% { caret-color: white; }
          51%, 100% { caret-color: transparent; }
        }
        
        .ProseMirror {
          caret-color: white !important;
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
        
        .ProseMirror:focus {
          caret-color: white !important;
        }
        
        .ProseMirror-focused {
          caret-color: white !important;
        }
        
        .ProseMirror ::selection {
          background-color: rgba(59, 130, 246, 0.4) !important;
          color: white !important;
        }
        
        .ProseMirror ::-moz-selection {
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
          selectionState.dragDeleteMode && "cursor-crosshair",
          titleClassName,
        )}
        onClick={() => {
          if (!readOnly) {
            editor?.commands.focus()
          }
        }}
        data-drag-delete={selectionState.dragDeleteMode}
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
