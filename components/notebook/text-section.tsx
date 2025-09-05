"use client"

import type React from "react"
import { useState, useRef } from "react"
import { RichTextEditor } from "../richtext/RichTextEditor"
import { CellContextMenu } from "./cell-context-menu"
import { MoreVertical, Trash2, Copy, Lock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TextSectionProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  dragHandleProps?: any
  onEmptyDelete?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onLock?: () => void
  onConvertToCode?: () => void
  onSplitCell?: (beforeText: string, afterText: string) => void
  isLocked?: boolean
  readOnly?: boolean
}

export function TextSection({
  value,
  onChange,
  placeholder = "Type your text...",
  dragHandleProps,
  onEmptyDelete,
  onDelete,
  onDuplicate,
  onLock,
  onConvertToCode,
  onSplitCell,
  isLocked = false,
  readOnly = false,
}: TextSectionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const editorRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
    })
  }

  const handleCopy = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      try {
        await navigator.clipboard.writeText(selection.toString())
      } catch (error) {
        console.warn("[v0] Copy failed:", error)
      }
    }
  }

  const handleCut = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      try {
        await navigator.clipboard.writeText(selection.toString())
        document.execCommand("delete")
      } catch (error) {
        console.warn("[v0] Cut failed:", error)
      }
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        // Use execCommand for better compatibility
        if (document.execCommand) {
          document.execCommand("insertText", false, text)
        } else {
          // Fallback for modern browsers
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(document.createTextNode(text))
            range.collapse(false)
          }
        }
      }
    } catch (error) {
      console.warn("[v0] Paste failed:", error)
    }
  }

  const handleSplitCell = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0)
      const textContent = editorRef.current.textContent || ""

      // Get cursor position in text
      let cursorPos = 0
      const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null)

      let node
      while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
          cursorPos += range.startOffset
          break
        }
        cursorPos += node.textContent?.length || 0
      }

      const beforeText = textContent.substring(0, cursorPos)
      const afterText = textContent.substring(cursorPos)

      if (onSplitCell) {
        onSplitCell(beforeText, afterText)
      }
    }
  }

  const getMenuState = () => {
    const selection = window.getSelection()
    const hasSelection = selection ? selection.toString().length > 0 : false
    return { hasSelection }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Backspace" || e.key === "Delete") && value.trim() === "" && onEmptyDelete) {
      e.preventDefault()
      onEmptyDelete()
    }
  }

  const handleEmptyBackspace = () => {
    if (value.trim() === "" && onEmptyDelete) {
      onEmptyDelete()
    }
  }

  const handleMouseEnter = () => {
    console.log("[v0] Text cell hovered")
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    console.log("[v0] Text cell hover ended")
    // Don't hide if dropdown is open
    if (!isDropdownOpen) {
      setIsHovered(false)
    }
  }

  return (
    <div
      className="w-full group relative transition-all duration-200 hover:bg-white/[0.02] rounded-lg p-2 -m-2"
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      ref={editorRef}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
        >
          <div className="w-4 h-4 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="drop-shadow-sm">
              <circle cx="3" cy="3" r="1" />
              <circle cx="9" cy="3" r="1" />
              <circle cx="3" cy="9" r="1" />
              <circle cx="9" cy="9" r="1" />
            </svg>
          </div>
        </div>
      )}

      {!readOnly && (isHovered || isLocked || isDropdownOpen) && (
        <div className="absolute top-1 right-1 z-20">
          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7 h-7 rounded-md bg-neutral-800/90 border border-neutral-600 flex items-center justify-center hover:bg-neutral-700 transition-colors shadow-lg backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("[v0] Dropdown button clicked")
                }}
              >
                <MoreVertical className="w-4 h-4 text-neutral-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-neutral-900 border-neutral-700 shadow-xl z-50"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate?.()
                  console.log("[v0] Duplicate clicked")
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onLock?.()
                  console.log("[v0] Lock clicked")
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLocked ? "Unlock" : "Lock"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.()
                  console.log("[v0] Delete clicked")
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <RichTextEditor
        content={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-base leading-relaxed"
        readOnly={isLocked || readOnly}
        onEmptyBackspace={handleEmptyBackspace}
      />

      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-neutral-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {isLocked && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-2 h-2 text-yellow-500" />
        </div>
      )}

      {contextMenu.visible && (
        <CellContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onSplitCell={handleSplitCell}
          onConvertToCode={onConvertToCode}
          {...getMenuState()}
          canPaste={true}
          isTextCell={true}
        />
      )}
    </div>
  )
}
