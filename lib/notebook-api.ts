import type { NotebookData, NotebookCellData } from "@/types/notebook"

export class NotebookAPI {
  private baseUrl: string

  constructor(baseUrl = "/api/notebooks") {
    this.baseUrl = baseUrl
  }

  // Create new notebook
  async createNotebook(title: string): Promise<NotebookData> {
    const response = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create notebook: ${response.statusText}`)
    }

    return response.json()
  }

  // Get notebook by ID
  async getNotebook(id: string): Promise<NotebookData> {
    const response = await fetch(`${this.baseUrl}/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch notebook: ${response.statusText}`)
    }

    return response.json()
  }

  // Update notebook (title, metadata)
  async updateNotebook(id: string, updates: Partial<NotebookData>): Promise<NotebookData> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update notebook: ${response.statusText}`)
    }

    return response.json()
  }

  // Save cell content (for autosave)
  async saveCell(notebookId: string, cell: NotebookCellData): Promise<NotebookCellData> {
    const response = await fetch(`${this.baseUrl}/${notebookId}/cells/${cell.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cell,
        notebookId,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save cell: ${response.statusText}`)
    }

    return response.json()
  }

  // Save multiple cells (batch operation)
  async saveCells(notebookId: string, cells: NotebookCellData[]): Promise<NotebookCellData[]> {
    const response = await fetch(`${this.baseUrl}/${notebookId}/cells/batch`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cells: cells.map((cell) => ({
          ...cell,
          notebookId,
          updatedAt: new Date().toISOString(),
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save cells: ${response.statusText}`)
    }

    return response.json()
  }

  // Delete notebook
  async deleteNotebook(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete notebook: ${response.statusText}`)
    }
  }
}

// Export singleton instance
export const notebookAPI = new NotebookAPI()
