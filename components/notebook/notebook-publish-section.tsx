"use client"

import { useState, useEffect } from "react"
import type { NotebookCellData, SeparatorData } from "@/types/notebook" // Added SeparatorData import
import { NotebookCell } from "./notebook-cell"
import { TitleBlock } from "./title-block"
import { TextSection } from "./text-section"
import { SeparatorBlock } from "./separator-block" // Added SeparatorBlock import
import { combineIntoItems } from "./editor/NotebookItems" // Import combineIntoItems

interface TextSectionData {
  id: string
  content: string
  order: number
}

interface NotebookPublishSectionProps {
  cells: NotebookCellData[]
  title: string
  textSections: TextSectionData[]
  separators?: SeparatorData[] // Added separators prop
  onShare: () => void
  onExport: () => void
  onGoToPreview: () => void
  onGoToEdit: () => void
}

export function NotebookPublishSection({
  cells: propCells,
  title = "Welcome to Axilary Notebook",
  textSections = [],
  separators = [], // Added separators with default empty array
}: NotebookPublishSectionProps) {
  const [cells, setCells] = useState<NotebookCellData[]>([])

  useEffect(() => {
    if (propCells) {
      setCells(propCells)
    }
  }, [propCells])

  const items = combineIntoItems(cells, textSections, separators)

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
            ) : item.type === "separator" ? (
              <SeparatorBlock separator={item.data as SeparatorData} readOnly />
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
