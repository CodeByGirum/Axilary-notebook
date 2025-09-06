"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Copy, Unlock, Edit3, Trash2, Plus } from "lucide-react"
import type { CellType } from "@/types/notebook"

interface CellMenuProps {
  cellId: string
  cellType: CellType
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddCell: (type: CellType, afterId?: string) => void
}

export function CellMenu({ cellId, cellType, onDelete, onDuplicate, onAddCell }: CellMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menuItems = [
    {
      label: "Duplicate",
      icon: Copy,
      onClick: () => {
        onDuplicate(cellId)
        setIsOpen(false)
      },
    },
    {
      label: "Unlock",
      icon: Unlock,
      onClick: () => {
        // Handle unlock
        setIsOpen(false)
      },
    },
    {
      label: "Rename",
      icon: Edit3,
      onClick: () => {
        // Handle rename
        setIsOpen(false)
      },
    },
    {
      label: "Add Cell",
      icon: Plus,
      onClick: () => {
        onAddCell("markdown", cellId)
        setIsOpen(false)
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => {
        onDelete(cellId)
        setIsOpen(false)
      },
      destructive: true,
    },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="grid h-3 w-3 place-items-center border border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5 hover:border-white/10 transition-all duration-200 ease-out opacity-60 hover:opacity-100"
        aria-label="Cell menu"
      >
        <MoreHorizontal className="h-1.5 w-1.5" />
      </button>

      <div
        className={`absolute right-0 z-10 mt-1 w-36 border border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm p-1 shadow-lg rounded-none transition-all duration-200 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-30 -translate-y-1 pointer-events-none hover:opacity-60"
        }`}
      >
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex w-full items-center gap-1 px-2 py-1 text-[9px] transition-all duration-150 ease-out hover:bg-white/5 ${
              item.destructive
                ? "text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/5"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <item.icon className="h-2.5 w-2.5" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
