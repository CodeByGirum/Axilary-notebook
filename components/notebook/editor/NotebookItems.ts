import { nanoid } from "nanoid"
import type { NotebookCellData } from "@/types/notebook"

export interface NotebookItem {
  id: string
  type: "cell" | "text"
  data: NotebookCellData | TextSectionData
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
 * Combines cells and text sections into a unified item array
 */
export function combineIntoItems(cells: NotebookCellData[], textSections: TextSectionData[]): NotebookItem[] {
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
  ]

  return sortItemsByOrder(items)
}

/**
 * Separates items back into cells and text sections
 */
export function separateItems(items: NotebookItem[]): {
  cells: NotebookCellData[]
  textSections: TextSectionData[]
} {
  const cells: NotebookCellData[] = []
  const textSections: TextSectionData[] = []

  items.forEach((item) => {
    if (item.type === "text") {
      textSections.push(item.data as TextSectionData)
    } else {
      cells.push(item.data as NotebookCellData)
    }
  })

  return { cells, textSections }
}

/**
 * Calculates the next available order number
 */
export function calculateNextOrder(items: NotebookItem[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((item) => item.order)) + 1
}
