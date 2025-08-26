"use client"

import { useState, useEffect } from "react"
import type { NotebookCellData } from "@/types/notebook"
import { NotebookCell } from "./notebook-cell"
import { TitleBlock } from "./title-block"
import { TextSection } from "./text-section"

interface TextSectionData {
  id: string
  content: string
  order: number // Added order field to match editor implementation
}

interface NotebookItem {
  id: string
  type: "cell" | "text"
  data: NotebookCellData | TextSectionData
  order: number // Added order field for proper sorting
}

interface NotebookPublisherProps {
  cells?: NotebookCellData[]
  title?: string
  textSections?: TextSectionData[]
}

export function NotebookPublisher({
  cells: propCells,
  title = "Welcome to Axilary Notebook",
  textSections = [],
}: NotebookPublisherProps) {
  const [cells, setCells] = useState<NotebookCellData[]>([])

  useEffect(() => {
    if (propCells) {
      setCells(propCells)
    }
  }, [propCells])

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
      order: cell.order,
    })),
  ].sort((a, b) => a.order - b.order) // Sort by order to maintain exact sequence

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <TitleBlock value={title} onChange={() => {}} placeholder="Untitled Notebook" readOnly />

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>
            {item.type === "text" ? (
              <TextSection
                value={(item.data as TextSectionData).content}
                onChange={() => {}}
                placeholder="Type your text..."
                readOnly
              />
            ) : (
              <NotebookCell
                cell={item.data as NotebookCellData}
                onUpdate={() => {}}
                onDelete={() => {}}
                onDuplicate={() => {}}
                onAddCell={() => {}}
                onExecute={() => {}}
                onGenerateCells={() => {}}
                onEmptyDelete={() => {}}
                readOnly
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
