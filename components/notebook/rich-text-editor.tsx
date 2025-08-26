"use client"

import { useEditor, EditorContent } from "@tiptap/react"
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
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { RichTextToolbar } from "./rich-text-toolbar"
import { SelectionContextMenu } from "./selection-context-menu"

// Custom extension to lock header sizes
const LockedHeaders = Extension.create({
  name: "lockedHeaders",

  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          level: {
            default: 1,
            rendered: false,
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setHeading:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode("heading", attributes)
        },
    }
  },
})

const ExcelSelection = Extension.create({
  name: "excelSelection",

  addKeyboardShortcuts() {
    return {
      // Shift + Arrow keys for extending selection
      "Shift-ArrowLeft": ({ editor }) => {
        const { selection } = editor.state
        const { from } = selection
        if (from > 0) {
          editor.commands.setTextSelection({ from: from - 1, to: selection.to })
        }
        return true
      },
      "Shift-ArrowRight": ({ editor }) => {
        const { selection } = editor.state
        const { to } = selection
        const docSize = editor.state.doc.content.size
        if (to < docSize) {
          editor.commands.setTextSelection({ from: selection.from, to: to + 1 })
        }
        return true
      },
      "Shift-ArrowUp": ({ editor }) => {
        // Move selection up by line
        const { selection } = editor.state
        const pos = editor.state.doc.resolve(selection.from)
        const line = pos.nodeBefore
        if (line) {
          const newFrom = Math.max(0, selection.from - 50) // Approximate line length
          editor.commands.setTextSelection({ from: newFrom, to: selection.to })
        }
        return true
      },
      "Shift-ArrowDown": ({ editor }) => {
        // Move selection down by line
        const { selection } = editor.state
        const docSize = editor.state.doc.content.size
        const newTo = Math.min(docSize, selection.to + 50) // Approximate line length
        editor.commands.setTextSelection({ from: selection.from, to: newTo })
        return true
      },
      // Ctrl/Cmd + Arrow for word jumping with selection
      "Shift-Mod-ArrowLeft": ({ editor }) => {
        const { selection } = editor.state
        const pos = editor.state.doc.resolve(selection.from)
        const wordStart = pos.pos - (pos.textOffset || 0)
        editor.commands.setTextSelection({ from: Math.max(0, wordStart), to: selection.to })
        return true
      },
      "Shift-Mod-ArrowRight": ({ editor }) => {
        const { selection } = editor.state
        const pos = editor.state.doc.resolve(selection.to)
        const wordEnd = pos.pos + (pos.parent.textContent.length - pos.textOffset)
        editor.commands.setTextSelection({ from: selection.from, to: Math.min(editor.state.doc.content.size, wordEnd) })
        return true
      },
      // Shift + Home/End for line selection
      "Shift-Home": ({ editor }) => {
        const { selection } = editor.state
        const pos = editor.state.doc.resolve(selection.from)
        const lineStart = pos.pos - pos.textOffset
        editor.commands.setTextSelection({ from: lineStart, to: selection.to })
        return true
      },
      "Shift-End": ({ editor }) => {
        const { selection } = editor.state
        const pos = editor.state.doc.resolve(selection.to)
        const lineEnd = pos.pos + (pos.parent.textContent.length - pos.textOffset)
        editor.commands.setTextSelection({ from: selection.from, to: lineEnd })
        return true
      },
    }
  },
})

// Custom extension for proper blinking cursor
const CursorStyling = Extension.create({
  name: "cursorStyling",

  addGlobalAttributes() {
    return [
      {
        types: ["doc"],
        attributes: {
          class: {
            default: "cursor-blink",
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return []
  },
})

const MouseDragSelection = Extension.create({
  name: "mouseDragSelection",

  addProseMirrorPlugins() {
    return []
  },

  addStorage() {
    return {
      isDragging: false,
      dragStartPos: null,
      dragDeleteMode: false,
      selectionDirection: "forward",
      wordBoundarySnap: false,
      lastDragPos: null,
    }
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
  onEmptyBackspace?: () => void // Added callback prop for empty backspace handling
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Type your text here...",
  className,
  readOnly = false,
  showToolbar: forceShowToolbar,
  isTitle = false,
  onEmptyBackspace, // Added onEmptyBackspace prop
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
  const editorRef = useRef<HTMLDivElement>(null)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<number | null>(null)
  const [dragDeleteMode, setDragDeleteMode] = useState(false)
  const [selectionDirection, setSelectionDirection] = useState<"forward" | "backward">("forward")
  const [wordBoundarySnap, setWordBoundarySnap] = useState(false)
  const [lastDragPos, setLastDragPos] = useState<number | null>(null)

  const findWordBoundary = (doc: any, pos: number, direction: "start" | "end") => {
    const docSize = doc.content.size
    const safePos = Math.max(0, Math.min(pos, docSize))

    try {
      const $pos = doc.resolve(safePos)
      const text = $pos.parent.textContent || ""
      const offset = $pos.textOffset || 0

      if (direction === "start") {
        // Find start of word
        let start = offset
        while (start > 0 && /\w/.test(text[start - 1])) {
          start--
        }
        const result = $pos.pos - offset + start
        return Math.max(0, Math.min(result, docSize))
      } else {
        // Find end of word
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
  }

  const createSmartSelection = (view: any, startPos: number, endPos: number, snapToWords = false) => {
    const docSize = view.state.doc.content.size
    const safeStartPos = Math.max(0, Math.min(startPos, docSize))
    const safeEndPos = Math.max(0, Math.min(endPos, docSize))

    let from = Math.min(safeStartPos, safeEndPos)
    let to = Math.max(safeStartPos, safeEndPos)

    if (snapToWords && from !== to) {
      // Snap to word boundaries for better selection
      try {
        from = findWordBoundary(view.state.doc, from, "start")
        to = findWordBoundary(view.state.doc, to, "end")
      } catch (error) {
        console.warn("[v0] Word boundary calculation failed, using original positions:", error)
        // Fall back to original positions if word boundary calculation fails
        from = Math.min(safeStartPos, safeEndPos)
        to = Math.max(safeStartPos, safeEndPos)
      }
    }

    // Determine selection direction
    const direction = safeStartPos <= safeEndPos ? "forward" : "backward"
    setSelectionDirection(direction)

    return { from, to, direction }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextStyle.configure({
        HTMLAttributes: {
          class: "text-style",
        },
      }),
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      LockedHeaders,
      ExcelSelection,
      CursorStyling,
      MouseDragSelection,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setIsTyping(true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 500)
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
        return // Don't hide if focus moved to toolbar
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
        setIsTyping(true)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 300)
      }
    },
    editorProps: {
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
      handleClick: (view, pos, event) => {
        const now = Date.now()
        const timeDiff = now - lastClickTime

        // Handle click outside text but within editor area
        const clickedElement = event.target as HTMLElement
        if (clickedElement && editorRef.current?.contains(clickedElement)) {
          // Find closest valid insertion point
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (coords) {
            view.dispatch(
              view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(coords.pos))),
            )
            view.focus()
          }
        }

        // Handle multi-selection with Ctrl/Cmd
        if (event.ctrlKey || event.metaKey) {
          const { selection } = view.state
          if (!selection.empty) {
            setMultiSelections((prev) => [...prev, { from: selection.from, to: selection.to }])
          }
          return true
        }

        // Handle triple-click for paragraph selection
        if (timeDiff < 500) {
          setClickCount((prev) => prev + 1)
        } else {
          setClickCount(1)
        }
        setLastClickTime(now)

        if (clickCount === 2) {
          // Triple-click (third click)
          // Select entire paragraph
          const $pos = view.state.doc.resolve(pos)
          const start = $pos.start($pos.depth)
          const end = $pos.end($pos.depth)
          view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, start, end)))
          return true
        }

        // Handle Shift-click for range selection
        if (event.shiftKey) {
          const { selection } = view.state
          const from = Math.min(selection.from, pos)
          const to = Math.max(selection.to, pos)
          view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)))
          return true
        }

        view.focus()
        return false
      },
      handleKeyDown: (view, event) => {
        // Handle Home/End keys
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
      handleDOMEvents: {
        contextmenu: (view, event) => {
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
        },
        mousedown: (view, event) => {
          if (event.button !== 0) return false // Only handle left mouse button

          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!pos) return false

          const isDoubleClick = event.detail === 2
          setWordBoundarySnap(isDoubleClick || event.ctrlKey || event.metaKey)

          // Check if Alt key is pressed for drag deletion mode
          if (event.altKey) {
            setDragDeleteMode(true)
          }

          setIsDragging(true)
          setDragStartPos(pos.pos)
          setLastDragPos(pos.pos)

          // Set cursor position at click point
          view.dispatch(
            view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(pos.pos))),
          )

          return false
        },
        mousemove: (view, event) => {
          if (!isDragging || dragStartPos === null) return false

          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!pos) return false

          const { from, to, direction } = createSmartSelection(view, dragStartPos, pos.pos, wordBoundarySnap)

          // Only update if position actually changed
          if (lastDragPos !== pos.pos) {
            setLastDragPos(pos.pos)

            // Create selection with proper direction handling
            if (from !== to) {
              view.dispatch(
                view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)),
              )

              const editorElement = view.dom as HTMLElement
              editorElement.style.cursor = direction === "forward" ? "text" : "w-resize"
            }
          }

          return true
        },
        mouseup: (view, event) => {
          if (!isDragging) return false

          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (pos && dragStartPos !== null) {
            const { from, to } = createSmartSelection(view, dragStartPos, pos.pos, wordBoundarySnap)

            // Final selection with smart boundaries
            if (from !== to) {
              view.dispatch(
                view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)),
              )
            }
          }

          setIsDragging(false)

          // Handle drag deletion if Alt was pressed
          if (dragDeleteMode) {
            const { selection } = view.state
            if (!selection.empty) {
              view.dispatch(view.state.tr.deleteSelection())
            }
            setDragDeleteMode(false)
          }

          // Reset drag state
          setDragStartPos(null)
          setLastDragPos(null)
          setWordBoundarySnap(false)

          const editorElement = view.dom as HTMLElement
          editorElement.style.cursor = "text"

          return false
        },
        mouseleave: (view, event) => {
          if (isDragging) {
            setIsDragging(false)
            setDragStartPos(null)
            setLastDragPos(null)
            setDragDeleteMode(false)
            setWordBoundarySnap(false)

            // Reset cursor
            const editorElement = view.dom as HTMLElement
            editorElement.style.cursor = "text"
          }
          return false
        },
        dblclick: (view, event) => {
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (!pos) return false

          const docSize = view.state.doc.content.size
          const safePos = Math.max(0, Math.min(pos.pos, docSize))

          try {
            const wordStart = findWordBoundary(view.state.doc, safePos, "start")
            const wordEnd = findWordBoundary(view.state.doc, safePos, "end")

            // Ensure positions are within bounds
            const boundedStart = Math.max(0, Math.min(wordStart, docSize))
            const boundedEnd = Math.max(0, Math.min(wordEnd, docSize))

            view.dispatch(
              view.state.tr.setSelection(
                view.state.selection.constructor.create(view.state.doc, boundedStart, boundedEnd),
              ),
            )
          } catch (error) {
            console.warn("[v0] Double-click word selection failed, falling back to character selection:", error)
            // Fall back to single character selection if word boundary fails
            view.dispatch(
              view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(safePos))),
            )
          }

          return true
        },
      },
    },
  })

  useEffect(() => {
    if (editor && !readOnly && !content) {
      // Auto-focus empty editors to show cursor immediately
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
        
        /* Enhanced cursor visibility */
        .ProseMirror {
          caret-color: white !important;
        }
        
        .ProseMirror:focus {
          caret-color: white !important;
        }
        
        /* Ensure cursor appears immediately on focus */
        .ProseMirror-focused {
          caret-color: white !important;
        }
        
        /* Enhanced drag selection styling */
        .ProseMirror {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
        
        /* Enhanced selection visual feedback */
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
          dragDeleteMode && "cursor-crosshair",
        )}
        onClick={() => {
          if (!readOnly) {
            editor?.commands.focus()
          }
        }}
        style={isTitle ? { fontSize: "48px", lineHeight: "1", fontWeight: "bold" } : undefined}
        data-drag-delete={dragDeleteMode}
      >
        <EditorContent
          editor={editor}
          className="w-full"
          style={
            isTitle
              ? { fontSize: "48px !important", lineHeight: "1 !important", fontWeight: "bold !important" }
              : undefined
          }
        />
        {!content && !readOnly && (
          <div
            className={cn(
              "absolute pointer-events-none text-white/40 leading-none",
              isTitle ? "top-3 left-0 font-bold" : "top-4 left-3 text-base leading-relaxed",
            )}
            style={isTitle ? { fontSize: "48px", lineHeight: "1", fontWeight: "bold" } : undefined}
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
