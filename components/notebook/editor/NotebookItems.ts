import { nanoid } from "nanoid"
import type { NotebookCellData, SeparatorData } from "@/types/notebook"

export interface NotebookItem {
  id: string
  type: "cell" | "text" | "separator" // Added separator type
  data: NotebookCellData | TextSectionData | SeparatorData // Added SeparatorData
  order: number
}

export interface TextSectionData {
  id: string
  content: string
  order: number
  isLocked?: boolean
}

export interface ClipboardData {
  type: "axilary-notebook-cells"
  version: "1.0"
  items: NotebookItem[]
  plainText: string
}

/**
 * Generates a unique ID with optional prefix for batch operations
 */
export function generateId(prefix?: string): string {
  const id = nanoid()
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Sorts notebook items by their order property
 */
export function sortItemsByOrder(items: NotebookItem[]): NotebookItem[] {
  return [...items].sort((a, b) => a.order - b.order)
}

/**
 * Combines cells, text sections, and separators into a unified item array
 */
export function combineIntoItems(
  cells: NotebookCellData[],
  textSections: TextSectionData[],
  separators: SeparatorData[] = [], // Added separators parameter
): NotebookItem[] {
  const items: NotebookItem[] = [
    ...textSections.map((section) => ({
      id: section.id,
      type: "text" as const,
      data: section,
      order: section.order,
    })),
    ...cells.map((cell) => ({
      id: cell.id,
      type: "cell" as const,
      data: cell,
      order: cell.order || 0,
    })),
    ...separators.map((separator) => ({
      id: separator.id,
      type: "separator" as const,
      data: separator,
      order: separator.order,
    })),
  ]

  return sortItemsByOrder(items)
}

/**
 * Separates items back into cells, text sections, and separators
 */
export function separateItems(items: NotebookItem[]): {
  cells: NotebookCellData[]
  textSections: TextSectionData[]
  separators: SeparatorData[] // Added separators return type
} {
  const cells: NotebookCellData[] = []
  const textSections: TextSectionData[] = []
  const separators: SeparatorData[] = [] // Added separators array

  items.forEach((item) => {
    if (item.type === "text") {
      textSections.push(item.data as TextSectionData)
    } else if (item.type === "separator") {
      // Added separator handling
      separators.push(item.data as SeparatorData)
    } else {
      cells.push(item.data as NotebookCellData)
    }
  })

  return { cells, textSections, separators }
}

/**
 * Calculates the next available order number
 */
export function calculateNextOrder(items: NotebookItem[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((item) => item.order)) + 1
}
