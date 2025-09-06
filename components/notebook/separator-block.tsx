"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"
import type { SeparatorData, SeparatorStyle } from "@/types/notebook"
import { cn } from "@/lib/utils"

interface SeparatorBlockProps {
  separator: SeparatorData
  onDelete?: (id: string) => void
  onStyleChange?: (id: string, style: SeparatorStyle) => void
  dragHandleProps?: any
  readOnly?: boolean
}

export function SeparatorBlock({
  separator,
  onDelete,
  onStyleChange,
  dragHandleProps,
  readOnly = false,
}: SeparatorBlockProps) {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsStyleMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getSeparatorStyles = (style: string) => {
    switch (style) {
      case "dotted":
        return "border-dotted border-t-2 border-white/20"
      case "dashed":
        return "border-dashed border-t-2 border-white/20"
      case "thick":
        return "border-t-4 border-white/30"
      default:
        return "border-t border-white/15"
    }
  }

  const styleOptions: { style: SeparatorStyle; label: string; preview: string }[] = [
    { style: "line", label: "Line", preview: "border-t border-white/15" },
    { style: "dotted", label: "Dotted", preview: "border-dotted border-t-2 border-white/20" },
    { style: "dashed", label: "Dashed", preview: "border-dashed border-t-2 border-white/20" },
    { style: "thick", label: "Thick", preview: "border-t-4 border-white/30" },
  ]

  const handleStyleChange = (newStyle: SeparatorStyle) => {
    console.log("[v0] Changing separator style to:", newStyle)
    onStyleChange?.(separator.id, newStyle)
    setIsStyleMenuOpen(false)
  }

  const toggleStyleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Before toggle - current state:", isStyleMenuOpen)
    const newState = !isStyleMenuOpen
    setIsStyleMenuOpen(newState)
    console.log("[v0] After toggle - new state:", newState)
  }

  return (
    <div className="group relative py-4">
      <div className="w-full flex items-center">
        <div className={cn("flex-1 transition-all duration-200", getSeparatorStyles(separator.style))} />
        <div
          {...dragHandleProps}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ zIndex: 1 }}
        />
      </div>

      {!readOnly && (
        <>
          <div
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:scale-105"
            ref={menuRef}
            style={{ zIndex: 10 }}
          >
            <button
              onClick={toggleStyleMenu}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-neutral-800/90 text-white/60 hover:text-white hover:bg-neutral-700 hover:border-white/40 transition-all duration-200 ease-out backdrop-blur-sm shadow-lg hover:shadow-xl"
              aria-label="Separator style menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <div
              className={cn(
                "absolute left-0 top-full z-50 mt-2 w-32 bg-neutral-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl overflow-hidden transition-all duration-200 ease-out",
                isStyleMenuOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {styleOptions.map((option) => (
                <button
                  key={option.style}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleStyleChange(option.style)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className={cn(
                    "flex w-full flex-col items-center gap-2 px-4 py-3 text-xs transition-all duration-150 ease-out hover:bg-white/10 hover:scale-105",
                    separator.style === option.style
                      ? "text-white bg-white/10 border-l-2 border-blue-400"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <div className={cn("w-full h-0.5 rounded", option.preview)} />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete?.(separator.id)
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:scale-105 flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-neutral-800/90 text-white/60 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/40 backdrop-blur-sm shadow-lg hover:shadow-xl"
            title="Delete separator"
            style={{ zIndex: 10 }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  )
}
