export interface TextEditorContent {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface TextEditorConfig {
  placeholder?: string
  readOnly?: boolean
  showToolbar?: boolean
  isTitle?: boolean
  titleSize?: "small" | "medium" | "large" | "extraLarge"
  autoSave?: boolean
  autoSaveDelay?: number
}

export interface TextEditorCallbacks {
  onCreate?: (content: TextEditorContent) => void
  onUpdate?: (content: TextEditorContent) => void
  onDelete?: (id: string) => void
  onEmptyBackspace?: () => void
}
