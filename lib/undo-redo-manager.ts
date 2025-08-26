interface UndoRedoCommand {
  id: string
  timestamp: number
  description: string
  undo: () => void
  redo: () => void
  focusState?: {
    elementId?: string
    selectionStart?: number
    selectionEnd?: number
    scrollPosition?: { x: number; y: number }
  }
}

interface UndoRedoManagerConfig {
  maxHistorySize: number
}

class UndoRedoManager {
  private undoStack: UndoRedoCommand[] = []
  private redoStack: UndoRedoCommand[] = []
  private config: UndoRedoManagerConfig
  private isExecuting = false

  constructor(config: UndoRedoManagerConfig = { maxHistorySize: 100 }) {
    this.config = config
    this.setupKeyboardShortcuts()
    this.exposeGlobalMethods()
  }

  private setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey

      if (ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault()
        this.undo()
      } else if (ctrlKey && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
        event.preventDefault()
        this.redo()
      }
    })
  }

  private exposeGlobalMethods() {
    if (typeof window !== "undefined") {
      ;(window as any).app = {
        ...(window as any).app,
        undo: () => this.undo(),
        redo: () => this.redo(),
        getUndoRedoState: () => ({
          canUndo: this.canUndo(),
          canRedo: this.canRedo(),
          undoStackSize: this.undoStack.length,
          redoStackSize: this.redoStack.length,
        }),
      }
    }
  }

  private captureFocusState(): UndoRedoCommand["focusState"] {
    const activeElement = document.activeElement as HTMLElement
    if (!activeElement) return undefined

    const focusState: UndoRedoCommand["focusState"] = {
      elementId: activeElement.id || undefined,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY,
      },
    }

    // Capture selection for text inputs and textareas
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      focusState.selectionStart = activeElement.selectionStart || 0
      focusState.selectionEnd = activeElement.selectionEnd || 0
    }

    return focusState
  }

  private restoreFocusState(focusState?: UndoRedoCommand["focusState"]) {
    if (!focusState) return

    // Restore scroll position
    if (focusState.scrollPosition) {
      window.scrollTo(focusState.scrollPosition.x, focusState.scrollPosition.y)
    }

    // Restore focus and selection
    if (focusState.elementId) {
      const element = document.getElementById(focusState.elementId)
      if (element) {
        element.focus()

        if (
          (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
          focusState.selectionStart !== undefined &&
          focusState.selectionEnd !== undefined
        ) {
          element.setSelectionRange(focusState.selectionStart, focusState.selectionEnd)
        }
      }
    }
  }

  private dispatchStateChangeEvent(action: "undo" | "redo", command: UndoRedoCommand) {
    const event = new CustomEvent("app:stateChanged", {
      detail: {
        action,
        id: command.id,
        timestamp: Date.now(),
        description: command.description,
      },
    })
    document.dispatchEvent(event)
  }

  executeCommand(command: Omit<UndoRedoCommand, "id" | "timestamp" | "focusState">) {
    if (this.isExecuting) return

    const fullCommand: UndoRedoCommand = {
      ...command,
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      focusState: this.captureFocusState(),
    }

    // Execute the command
    this.isExecuting = true
    try {
      fullCommand.redo()
    } finally {
      this.isExecuting = false
    }

    // Add to undo stack
    this.undoStack.push(fullCommand)

    // Clear redo stack when new command is executed
    this.redoStack = []

    // Maintain stack size limit
    if (this.undoStack.length > this.config.maxHistorySize) {
      this.undoStack.shift()
    }

    this.dispatchStateChangeEvent("redo", fullCommand)
  }

  undo(): boolean {
    if (!this.canUndo() || this.isExecuting) return false

    const command = this.undoStack.pop()!
    this.isExecuting = true

    try {
      command.undo()
      this.restoreFocusState(command.focusState)
    } finally {
      this.isExecuting = false
    }

    this.redoStack.push(command)
    this.dispatchStateChangeEvent("undo", command)

    return true
  }

  redo(): boolean {
    if (!this.canRedo() || this.isExecuting) return false

    const command = this.redoStack.pop()!
    this.isExecuting = true

    try {
      command.redo()
      this.restoreFocusState(command.focusState)
    } finally {
      this.isExecuting = false
    }

    this.undoStack.push(command)
    this.dispatchStateChangeEvent("redo", command)

    return true
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }

  getHistory() {
    return {
      undoStack: [...this.undoStack],
      redoStack: [...this.redoStack],
    }
  }
}

export const undoRedoManager = new UndoRedoManager()
export type { UndoRedoCommand }
