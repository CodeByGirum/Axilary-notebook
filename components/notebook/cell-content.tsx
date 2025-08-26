"use client"

import type { NotebookCellData } from "@/types/notebook"
import { PythonCell } from "./cells/python-cell"
import { RCell } from "./cells/r-cell"
import { SqlCell } from "./cells/sql-cell"
import { ChartCell } from "./cells/chart-cell"
import { TableCell } from "./cells/table-cell"
import { ParamsCell } from "./cells/params-cell"
import { PromptCell } from "./cells/prompt-cell"

interface CellContentProps {
  cell: NotebookCellData
  onChange: (content: string) => void
  isRunning?: boolean
  onGenerateCells?: (cells: Partial<NotebookCellData>[]) => void
}

export function CellContent({ cell, onChange, isRunning, onGenerateCells }: CellContentProps) {
  const commonProps = {
    content: cell.content,
    output: cell.output,
    metadata: cell.metadata,
    onChange,
    isRunning,
  }

  switch (cell.type) {
    case "python":
      return <PythonCell {...commonProps} />
    case "r":
      return <RCell {...commonProps} />
    case "sql":
      return <SqlCell {...commonProps} />
    case "chart":
      return <ChartCell {...commonProps} />
    case "table":
      return <TableCell {...commonProps} />
    case "params":
      return <ParamsCell {...commonProps} />
    case "prompt":
      return <PromptCell {...commonProps} onGenerateCells={onGenerateCells} />
    default:
      return <div className="text-white/60 text-[9px]">Unknown cell type: {cell.type}</div>
  }
}
