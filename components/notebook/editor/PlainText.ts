import type { NotebookItem, TextSectionData } from "./NotebookItems"
import type { NotebookCellData } from "@/types/notebook"

/**
 * Generates plain text representation of notebook items
 */
export function generatePlainText(items: NotebookItem[]): string {
  return items
    .map((item) => {
      if (item.type === "text") {
        return (item.data as TextSectionData).content
      } else {
        const cell = item.data as NotebookCellData
        return `# ${cell.metadata.title}\n${cell.content}${cell.output ? `\n\nOutput:\n${cell.output}` : ""}`
      }
    })
    .join("\n\n---\n\n")
}
