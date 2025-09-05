"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { RichTextToolbar } from "../notebook/rich-text-toolbar"
import { SelectionContextMenu } from "../notebook/selection-context-menu"
import { useRichTextSelection } from "./hooks/useRichTextSelection"
import { useTypingIndicator } from "./hooks/useTypingIndicator"
import { useEditorProps } from "./hooks/useEditorProps"
import { TitleSize, getTitleClassName } from "./titleSize"

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
  const { isTyping, setTypingState } = useTypingIndicator()

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

  const createSmartSelection = useCallback(
    (view: any, startPos: number, endPos: number, snapToWords = false) => {
      const docSize = view.state.doc.content.size
      const safeStartPos = Math.max(0, Math.min(startPos, docSize))
      const safeEndPos = Math.max(0, Math.min(endPos, docSize))

      let from = Math.min(safeStartPos, safeEndPos)
      let to = Math.max(safeStartPos, safeEndPos)

      if (snapToWords && from !== to) {
        try {
          from = findWordBoundary(view.state.doc, from, "start")
          to = findWordBoundary(view.state.doc, to, "end")
        } catch (error) {
          console.warn("[v0] Word boundary calculation failed, using original positions:", error)
          from = Math.min(safeStartPos, safeEndPos)
          to = Math.max(safeStartPos, safeEndPos)
        }
      }

      const direction = safeStartPos <= safeEndPos ? "forward" : "backward"
      setSelectionState((prev) => ({ ...prev, selectionDirection: direction }))

      return { from, to, direction }
    },
    [findWordBoundary],
  )

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

  const selectionHandlers = useRichTextSelection(
    selectionState,
    (updates) => setSelectionState((prev) => ({ ...prev, ...updates })),
    multiSelections,
    setMultiSelections,
    editorRef,
    findWordBoundary,
    createSmartSelection,
  )

  const { extensions, editorProps } = useEditorProps({
    isTitle,
    className,
    readOnly,
    onEmptyBackspace,
    selectionHandlers,
    contextMenuHandler: handleContextMenu,
    keyDownHandler: handleKeyDown,
  })

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
