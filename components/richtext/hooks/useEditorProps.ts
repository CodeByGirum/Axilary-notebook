"use client"

import { useMemo } from "react"
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
import { cn } from "@/lib/utils"

interface EditorPropsConfig {
  isTitle: boolean
  className?: string
  readOnly: boolean
  onEmptyBackspace?: () => void
  selectionHandlers: {
    handleClick: (view: any, pos: number, event: MouseEvent) => boolean
    handleMouseDown: (view: any, event: MouseEvent) => boolean
    handleMouseMove: (view: any, event: MouseEvent) => boolean
    handleMouseUp: (view: any, event: MouseEvent) => boolean
    handleMouseLeave: (view: any, event: MouseEvent) => boolean
    handleDoubleClick: (view: any, event: MouseEvent) => boolean
  }
  contextMenuHandler: (view: any, event: MouseEvent) => boolean
  keyDownHandler: (view: any, event: KeyboardEvent) => boolean
}

/**
 * Builds extensions array and editor props configuration
 */
export function useEditorProps({
  isTitle,
  className,
  readOnly,
  onEmptyBackspace,
  selectionHandlers,
  contextMenuHandler,
  keyDownHandler,
}: EditorPropsConfig) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: false, // Disable built-in link to use our custom Link extension
        underline: false, // Disable built-in underline to use our custom Underline extension
      }),
      TextStyle,
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
    ],
    [],
  )

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
      handleClick: selectionHandlers.handleClick,
      handleKeyDown: keyDownHandler,
      handleDOMEvents: {
        contextmenu: contextMenuHandler,
        mousedown: selectionHandlers.handleMouseDown,
        mousemove: selectionHandlers.handleMouseMove,
        mouseup: selectionHandlers.handleMouseUp,
        mouseleave: selectionHandlers.handleMouseLeave,
        dblclick: selectionHandlers.handleDoubleClick,
      },
    }),
    [isTitle, className, selectionHandlers, contextMenuHandler, keyDownHandler],
  )

  return { extensions, editorProps }
}
