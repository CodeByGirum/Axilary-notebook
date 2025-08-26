"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TextEditorToolbar } from "./text-editor-toolbar"

interface MarkdownInputProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function MarkdownInput({
  content,
  onChange,
  placeholder = "Type something...",
  className,
  readOnly = false,
}: MarkdownInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  const handleFormat = (format: string, value?: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let newText = content

    switch (format) {
      case "bold":
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end)
        break
      case "italic":
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
        break
      case "underline":
        newText = content.substring(0, start) + `<u>${selectedText}</u>` + content.substring(end)
        break
      case "strikethrough":
        newText = content.substring(0, start) + `~~${selectedText}~~` + content.substring(end)
        break
      case "code":
        newText = content.substring(0, start) + `\`${selectedText}\`` + content.substring(end)
        break
      case "link":
        const url = prompt("Enter URL:")
        if (url) {
          newText = content.substring(0, start) + `[${selectedText || "Link"}](${url})` + content.substring(end)
        }
        break
      case "bulletList":
        newText = content.substring(0, start) + `\n- ${selectedText}` + content.substring(end)
        break
      case "numberedList":
        newText = content.substring(0, start) + `\n1. ${selectedText}` + content.substring(end)
        break
      case "heading":
        if (value) {
          const headingLevel =
            value === "h1"
              ? "# "
              : value === "h2"
                ? "## "
                : value === "h3"
                  ? "### "
                  : value === "h4"
                    ? "#### "
                    : value === "h5"
                      ? "##### "
                      : value === "h6"
                        ? "###### "
                        : ""
          newText = content.substring(0, start) + `${headingLevel}${selectedText}` + content.substring(end)
        }
        break
    }

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start, end)
      }
    }, 0)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [content, isEditing])

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return ""

    return (
      text
        // Headers
        .replace(/^### (.*$)/gm, '<h3 class="text-white text-[11px] font-medium mb-1">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-white text-[13px] font-medium mb-1">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-white text-[15px] font-medium mb-2">$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium">$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
        .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
        // Links
        .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-blue-400 underline">$1</a>')
        // Code
        .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-[8px] font-mono">$1</code>')
        // Line breaks
        .replace(/\n/g, "<br>")
    )
  }

  const handleFocus = () => {
    if (!readOnly) {
      setIsEditing(true)
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && (e.relatedTarget as Element).closest(".text-editor-toolbar")) {
      return
    }
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  if (isEditing && !readOnly) {
    return (
      <div className="space-y-2">
        <TextEditorToolbar onFormat={handleFormat} className="text-editor-toolbar" />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent border-none outline-none resize-none",
            "text-white text-[9px] leading-tight min-h-[2rem] py-2",
            "placeholder:text-white/40",
            className,
          )}
          style={{
            wordBreak: "break-word",
            overflow: "hidden",
          }}
          autoFocus
        />
      </div>
    )
  }

  if (!content) {
    return (
      <div
        onClick={handleFocus}
        className={cn("text-white/40 text-[9px] leading-tight cursor-text min-h-[2rem] py-2", className)}
      >
        {placeholder}
      </div>
    )
  }

  return (
    <div
      ref={displayRef}
      onClick={handleFocus}
      className={cn(
        "w-full cursor-text text-[9px] leading-tight min-h-[2rem] py-2",
        "prose prose-invert prose-sm max-w-none",
        readOnly && "cursor-default",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
