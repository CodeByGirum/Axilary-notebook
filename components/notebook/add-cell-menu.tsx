"use client"

import { Code, Database, BarChart3, Table, Settings, Sparkles, Minus, Type } from "lucide-react"
import type { CellType } from "@/types/notebook"
import type { AddCellMenuProps } from "@/types/notebook"

const allItems = [
  { type: "text" as CellType, icon: Type, label: "Text", description: "Rich text with markdown" },
  { type: "prompt" as CellType, icon: Sparkles, label: "AI Prompt", description: "Generate cells with AI" },
  { type: "python" as CellType, icon: Code, label: "Python", description: "Python code execution" },
  { type: "r" as CellType, icon: Code, label: "R", description: "R statistical computing" },
  { type: "sql" as CellType, icon: Database, label: "SQL", description: "Database queries" },
  { type: "chart" as CellType, icon: BarChart3, label: "Chart", description: "Data visualization" },
  { type: "table" as CellType, icon: Table, label: "Table", description: "Data tables" },
  { type: "params" as CellType, icon: Settings, label: "Params", description: "Parameters & controls" },
  { type: "separator" as const, icon: Minus, label: "Separator", description: "Visual separator line" },
]

export function AddCellMenu({ onAddCell, onAddSeparator }: AddCellMenuProps) {
  const handleItemClick = (type: CellType | "separator") => {
    if (type === "separator") {
      onAddSeparator?.("line") // Default to line separator
    } else {
      onAddCell(type)
    }
  }

  return (
    <div className="relative flex justify-center">
      <div className="transition-all duration-300 ease-out opacity-30 hover:opacity-80">
        <div className="card p-3 min-w-[600px] border-white/5 hover:border-white/10 transition-all duration-200">
          <div className="grid grid-cols-5 gap-2 max-h-[80px]">
            {allItems.map(({ type, icon: Icon, label, description }) => (
              <button
                key={type}
                onClick={() => handleItemClick(type)}
                className="flex flex-col items-center gap-1 px-2 py-2 text-xs hover:bg-white/5 rounded transition-all duration-150 ease-out text-center text-white/70 hover:text-white/90 border border-transparent hover:border-white/5"
                title={description}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate w-full">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
