export type CellType = "python" | "r" | "sql" | "chart" | "gpu" | "table" | "params" | "prompt"

export interface CellMetadata {
  title: string
  locked?: boolean
  description?: string
  chartData?: {
    type: string
    data: any[]
  }
  parameters?: Record<string, any>
}

export interface NotebookCellData {
  id: string
  type: CellType
  content: string
  output?: string
  metadata: CellMetadata
  order?: number // Added order field for proper sequencing in mixed content
}

export interface CellExecutionResult {
  success: boolean
  output?: string
  error?: string
  data?: any
}

export interface AddCellMenuProps {
  onAddCell: (type: CellType) => void
  onAddSeparator?: (style: string) => void
}
