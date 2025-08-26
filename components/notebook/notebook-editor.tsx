"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { NotebookCell } from "./notebook-cell"
import { NotebookToolbar } from "./notebook-toolbar"
import { TitleBlock } from "./title-block"
import { TextSection } from "./text-section"
import { BlockSeparator } from "./block-separator"
import { SelectionOverlay } from "./selection-overlay"
import { FloatingSelectionToolbar } from "./floating-selection-toolbar"
import { useCellSelection } from "@/hooks/use-cell-selection"
import { useNotebookEngine } from "@/hooks/use-notebook-engine"
import type { CellType, NotebookCellData } from "@/types/notebook"

interface NotebookEditorProps {
  initialCells?: NotebookCellData[]
  initialTitle?: string
  initialTextSections?: TextSectionData[]
  onCellsChange?: (cells: NotebookCellData[]) => void
  onTitleChange?: (title: string) => void
  onTextSectionsChange?: (textSections: TextSectionData[]) => void
}

interface NotebookItem {
  id: string
  type: "cell" | "text"
  data: NotebookCellData | TextSectionData
  order: number
}

interface TextSectionData {
  id: string
  content: string
  order: number
  isLocked?: boolean
}

interface ClipboardData {
  type: "axilary-notebook-cells"
  version: "1.0"
  items: Array<{
    id: string
    type: "cell" | "text"
    data: NotebookCellData | TextSectionData
    order: number
  }>
  plainText: string
}

export function NotebookEditor({
  initialCells = [],
  initialTitle = "Welcome to Axilary Notebook",
  initialTextSections = [],
  onCellsChange,
  onTitleChange,
  onTextSectionsChange,
}: NotebookEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [cells, setCells] = useState<NotebookCellData[]>(initialCells)
  const [textSections, setTextSections] = useState<TextSectionData[]>(initialTextSections)
  const [nextOrder, setNextOrder] = useState(0)
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null)
  const [undoHistory, setUndoHistory] = useState<Array<{ cells: NotebookCellData[]; textSections: TextSectionData[] }>>(
    [],
  )
  const initializedRef = useRef(false)
  const { executeCell, executeAllCells, isExecuting, restartKernel, interruptExecution } = useNotebookEngine()

  const {
    selectionState,
    containerRef,
    selectCell,
    selectAll,
    clearSelection,
    startMarqueeSelection,
    updateMarqueeSelection,
    endMarqueeSelection,
    handleKeyDown,
  } = useCellSelection()

  useEffect(() => {
    if (!initializedRef.current) {
      const allItems = [...initialCells, ...initialTextSections]
      const maxOrder = allItems.length > 0 ? Math.max(...allItems.map((item) => item.order || 0)) : -1
      setNextOrder(maxOrder + 1)
      initializedRef.current = true
    }
  }, [])

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
  ].sort((a, b) => a.order - b.order)

  const onCellsChangeRef = useRef(onCellsChange)
  const onTitleChangeRef = useRef(onTitleChange)
  const onTextSectionsChangeRef = useRef(onTextSectionsChange)

  useEffect(() => {
    onCellsChangeRef.current = onCellsChange
  }, [onCellsChange])

  useEffect(() => {
    onTitleChangeRef.current = onTitleChange
  }, [onTitleChange])

  useEffect(() => {
    onTextSectionsChangeRef.current = onTextSectionsChange
  }, [onTextSectionsChange])

  useEffect(() => {
    if (onCellsChangeRef.current) {
      onCellsChangeRef.current(cells)
    }
  }, [cells])

  useEffect(() => {
    if (onTitleChangeRef.current) {
      onTitleChangeRef.current(title)
    }
  }, [title])

  useEffect(() => {
    if (onTextSectionsChangeRef.current) {
      onTextSectionsChangeRef.current(textSections)
    }
  }, [textSections])

  const handleExecuteCell = async (cell: NotebookCellData) => {
    const result = await executeCell(cell)
    if (result.success && result.output) {
      updateCell(cell.id, { output: result.output })
    }
  }

  const addCell = (type: CellType, afterId?: string) => {
    if (type === "text") {
      addTextSection(afterId)
      return
    }

    const newCell: NotebookCellData = {
      id: Date.now().toString(),
      type,
      content: "",
      metadata: { title: `New ${type}` },
      order: nextOrder,
    }

    setCells([...cells, newCell])
    setNextOrder(nextOrder + 1)
  }

  const handleGenerateCells = (generatedCells: Partial<NotebookCellData>[], afterId?: string) => {
    const newCells = generatedCells.map((cellData, index) => ({
      id: `${Date.now()}-${index}`,
      content: "",
      metadata: { title: "Generated Cell" },
      ...cellData,
    })) as NotebookCellData[]

    if (afterId) {
      const index = cells.findIndex((cell) => cell.id === afterId)
      const newCellsArray = [...cells]
      newCellsArray.splice(index + 1, 0, ...newCells)
      setCells(newCellsArray)
    } else {
      setCells([...cells, ...newCells])
    }
  }

  const updateCell = (id: string, updates: Partial<NotebookCellData>) => {
    setCells(cells.map((cell) => (cell.id === id ? { ...cell, ...updates } : cell)))
  }

  const deleteCell = (id: string) => {
    setCells(cells.filter((cell) => cell.id !== id))
  }

  const duplicateCell = (id: string) => {
    const cell = cells.find((c) => c.id === id)
    if (cell) {
      const duplicate = {
        ...cell,
        id: Date.now().toString(),
        metadata: { ...cell.metadata, title: `${cell.metadata.title} Copy` },
      }
      const index = cells.findIndex((c) => c.id === id)
      const newCellsArray = [...cells]
      newCellsArray.splice(index + 1, 0, duplicate)
      setCells(newCellsArray)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const draggedItemId = result.draggableId
    const isSelectedCell = selectionState.selectedCells.has(draggedItemId)

    if (isSelectedCell && selectionState.selectedCells.size > 1) {
      // Multi-cell drag: move all selected cells as a block
      const selectedItems = items.filter((item) => selectionState.selectedCells.has(item.id))
      const nonSelectedItems = items.filter((item) => !selectionState.selectedCells.has(item.id))

      // Sort selected items by their current order to maintain relative positioning
      selectedItems.sort((a, b) => a.order - b.order)

      // Insert the block at the destination
      const reorderedItems = [...nonSelectedItems]
      reorderedItems.splice(result.destination.index, 0, ...selectedItems)

      // Update orders
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
        data: { ...item.data, order: index },
      }))

      const newTextSections: TextSectionData[] = []
      const newCells: NotebookCellData[] = []

      updatedItems.forEach((item) => {
        if (item.type === "text") {
          newTextSections.push(item.data as TextSectionData)
        } else {
          newCells.push(item.data as NotebookCellData)
        }
      })

      setTextSections(newTextSections)
      setCells(newCells)
      setNextOrder(Math.max(...updatedItems.map((item) => item.order)) + 1)
    } else {
      // Single cell drag: original behavior
      const reorderedItems = Array.from(items)
      const [reorderedItem] = reorderedItems.splice(result.source.index, 1)
      reorderedItems.splice(result.destination.index, 0, reorderedItem)

      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index,
        data: { ...item.data, order: index },
      }))

      const newTextSections: TextSectionData[] = []
      const newCells: NotebookCellData[] = []

      updatedItems.forEach((item) => {
        if (item.type === "text") {
          newTextSections.push(item.data as TextSectionData)
        } else {
          newCells.push(item.data as NotebookCellData)
        }
      })

      setTextSections(newTextSections)
      setCells(newCells)
      setNextOrder(Math.max(...updatedItems.map((item) => item.order)) + 1)
    }
  }

  const addTextSection = (afterId?: string) => {
    const newTextSection: TextSectionData = {
      id: Date.now().toString(),
      content: "",
      order: nextOrder,
    }

    setTextSections([...textSections, newTextSection])
    setNextOrder(nextOrder + 1)

    setTimeout(() => {
      const element = document.getElementById(`text-section-${newTextSection.id}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        const textarea = element.querySelector("textarea")
        if (textarea) {
          textarea.focus()
        }
      }
    }, 100)
  }

  const updateTextSection = (id: string, content: string) => {
    setTextSections(textSections.map((section) => (section.id === id ? { ...section, content } : section)))
  }

  const deleteTextSection = (id: string) => {
    setTextSections(textSections.filter((section) => section.id !== id))
  }

  const duplicateTextSection = (id: string) => {
    const section = textSections.find((s) => s.id === id)
    if (section) {
      const duplicate: TextSectionData = {
        ...section,
        id: Date.now().toString(),
        order: nextOrder,
      }
      setTextSections([...textSections, duplicate])
      setNextOrder(nextOrder + 1)

      setTimeout(() => {
        const element = document.getElementById(`text-section-${duplicate.id}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }

  const toggleTextSectionLock = (id: string) => {
    setTextSections(
      textSections.map((section) => (section.id === id ? { ...section, isLocked: !section.isLocked } : section)),
    )
  }

  const handleAddSeparator = (style: string) => {
    // Implementation for adding separator
  }

  const handleEmptyDelete = (id: string, type: "cell" | "text") => {
    if (type === "cell") {
      deleteCell(id)
    } else {
      setTextSections(textSections.filter((section) => section.id !== id))
    }
  }

  const handleMoveUp = () => {
    if (selectionState.selectedCells.size === 0) return

    const selectedItems = items.filter((item) => selectionState.selectedCells.has(item.id))
    const nonSelectedItems = items.filter((item) => !selectionState.selectedCells.has(item.id))

    // Sort selected items by their current order
    selectedItems.sort((a, b) => a.order - b.order)

    // Find the earliest position we can move to
    const firstSelectedIndex = items.findIndex((item) => item.id === selectedItems[0].id)
    if (firstSelectedIndex === 0) return // Already at top

    // Move the block up by one position
    const reorderedItems = [...items]
    selectedItems.forEach((item) => {
      const currentIndex = reorderedItems.findIndex((i) => i.id === item.id)
      reorderedItems.splice(currentIndex, 1)
    })

    const insertIndex = Math.max(0, firstSelectedIndex - 1)
    reorderedItems.splice(insertIndex, 0, ...selectedItems)

    // Update orders
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index,
      data: { ...item.data, order: index },
    }))

    const newTextSections: TextSectionData[] = []
    const newCells: NotebookCellData[] = []

    updatedItems.forEach((item) => {
      if (item.type === "text") {
        newTextSections.push(item.data as TextSectionData)
      } else {
        newCells.push(item.data as NotebookCellData)
      }
    })

    setTextSections(newTextSections)
    setCells(newCells)
    setNextOrder(Math.max(...updatedItems.map((item) => item.order)) + 1)
  }

  const handleMoveDown = () => {
    if (selectionState.selectedCells.size === 0) return

    const selectedItems = items.filter((item) => selectionState.selectedCells.has(item.id))
    const nonSelectedItems = items.filter((item) => !selectionState.selectedCells.has(item.id))

    // Sort selected items by their current order
    selectedItems.sort((a, b) => a.order - b.order)

    // Find the latest position we can move to
    const lastSelectedIndex = items.findIndex((item) => item.id === selectedItems[selectedItems.length - 1].id)
    if (lastSelectedIndex === items.length - 1) return // Already at bottom

    // Move the block down by one position
    const reorderedItems = [...items]
    selectedItems.forEach((item) => {
      const currentIndex = reorderedItems.findIndex((i) => i.id === item.id)
      reorderedItems.splice(currentIndex, 1)
    })

    const insertIndex = Math.min(reorderedItems.length, lastSelectedIndex - selectedItems.length + 2)
    reorderedItems.splice(insertIndex, 0, ...selectedItems)

    // Update orders
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index,
      data: { ...item.data, order: index },
    }))

    const newTextSections: TextSectionData[] = []
    const newCells: NotebookCellData[] = []

    updatedItems.forEach((item) => {
      if (item.type === "text") {
        newTextSections.push(item.data as TextSectionData)
      } else {
        newCells.push(item.data as NotebookCellData)
      }
    })

    setTextSections(newTextSections)
    setCells(newCells)
    setNextOrder(Math.max(...updatedItems.map((item) => item.order)) + 1)
  }

  const saveStateForUndo = () => {
    setUndoHistory((prev) => [...prev.slice(-9), { cells: [...cells], textSections: [...textSections] }])
  }

  const getSelectedItemsInOrder = () => {
    return items.filter((item) => selectionState.selectedCells.has(item.id)).sort((a, b) => a.order - b.order)
  }

  const generatePlainText = (items: NotebookItem[]) => {
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

  const handleCopy = async () => {
    if (selectionState.selectedCells.size === 0) return

    const selectedItems = getSelectedItemsInOrder()
    const plainText = generatePlainText(selectedItems)

    const clipboardPayload: ClipboardData = {
      type: "axilary-notebook-cells",
      version: "1.0",
      items: selectedItems,
      plainText,
    }

    setClipboardData(clipboardPayload)

    // Copy to system clipboard
    try {
      await navigator.clipboard.writeText(JSON.stringify(clipboardPayload))
      // Also copy plain text as fallback
      await navigator.clipboard.writeText(plainText)
    } catch (error) {
      console.warn("[v0] Failed to copy to clipboard:", error)
    }

    console.log("[v0] Copied", selectedItems.length, "items to clipboard")
  }

  const handleCut = async () => {
    if (selectionState.selectedCells.size === 0) return

    saveStateForUndo()
    await handleCopy()

    // Remove selected items
    const selectedIds = new Set(selectionState.selectedCells)
    const newCells = cells.filter((cell) => !selectedIds.has(cell.id))
    const newTextSections = textSections.filter((section) => !selectedIds.has(section.id))

    setCells(newCells)
    setTextSections(newTextSections)
    clearSelection()

    console.log("[v0] Cut", selectedIds.size, "items")
  }

  const handlePaste = async () => {
    if (!clipboardData && !selectionState.lastFocusedCell) return

    let dataToUse = clipboardData

    // Try to get data from system clipboard if no internal data
    if (!dataToUse) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        const parsed = JSON.parse(clipboardText)
        if (parsed.type === "axilary-notebook-cells") {
          dataToUse = parsed
        }
      } catch (error) {
        console.warn("[v0] Failed to parse clipboard data:", error)
        return
      }
    }

    if (!dataToUse) return

    saveStateForUndo()

    // Find insertion point (after last focused cell)
    const insertionIndex = selectionState.lastFocusedCell
      ? items.findIndex((item) => item.id === selectionState.lastFocusedCell) + 1
      : items.length

    // Create new items with new IDs
    const newItems = dataToUse.items.map((item, index) => {
      const newId = `${Date.now()}-paste-${index}`
      const newOrder = insertionIndex + index

      if (item.type === "text") {
        const textData = item.data as TextSectionData
        return {
          id: newId,
          type: "text" as const,
          data: { ...textData, id: newId, order: newOrder },
          order: newOrder,
        }
      } else {
        const cellData = item.data as NotebookCellData
        return {
          id: newId,
          type: "cell" as const,
          data: { ...cellData, id: newId, order: newOrder },
          order: newOrder,
        }
      }
    })

    // Update orders for existing items after insertion point
    const updatedItems = items.map((item) => {
      if (item.order >= insertionIndex) {
        return {
          ...item,
          order: item.order + newItems.length,
          data: { ...item.data, order: item.order + newItems.length },
        }
      }
      return item
    })

    // Combine all items
    const allItems = [...updatedItems, ...newItems].sort((a, b) => a.order - b.order)

    // Separate into cells and text sections
    const newCells: NotebookCellData[] = []
    const newTextSections: TextSectionData[] = []

    allItems.forEach((item) => {
      if (item.type === "text") {
        newTextSections.push(item.data as TextSectionData)
      } else {
        newCells.push(item.data as NotebookCellData)
      }
    })

    setCells(newCells)
    setTextSections(newTextSections)
    setNextOrder(Math.max(...allItems.map((item) => item.order)) + 1)

    console.log("[v0] Pasted", newItems.length, "items")
  }

  const handleDuplicate = () => {
    if (selectionState.selectedCells.size === 0) return

    saveStateForUndo()

    const selectedItems = getSelectedItemsInOrder()
    const lastSelectedItem = selectedItems[selectedItems.length - 1]
    const insertionIndex = items.findIndex((item) => item.id === lastSelectedItem.id) + 1

    // Create duplicates
    const duplicateItems = selectedItems.map((item, index) => {
      const newId = `${Date.now()}-duplicate-${index}`
      const newOrder = insertionIndex + index

      if (item.type === "text") {
        const textData = item.data as TextSectionData
        return {
          id: newId,
          type: "text" as const,
          data: { ...textData, id: newId, order: newOrder },
          order: newOrder,
        }
      } else {
        const cellData = item.data as NotebookCellData
        return {
          id: newId,
          type: "cell" as const,
          data: {
            ...cellData,
            id: newId,
            order: newOrder,
            metadata: { ...cellData.metadata, title: `${cellData.metadata.title} Copy` },
          },
          order: newOrder,
        }
      }
    })

    // Update orders for existing items after insertion point
    const updatedItems = items.map((item) => {
      if (item.order >= insertionIndex) {
        return {
          ...item,
          order: item.order + duplicateItems.length,
          data: { ...item.data, order: item.order + duplicateItems.length },
        }
      }
      return item
    })

    // Combine all items
    const allItems = [...updatedItems, ...duplicateItems].sort((a, b) => a.order - b.order)

    // Separate into cells and text sections
    const newCells: NotebookCellData[] = []
    const newTextSections: TextSectionData[] = []

    allItems.forEach((item) => {
      if (item.type === "text") {
        newTextSections.push(item.data as TextSectionData)
      } else {
        newCells.push(item.data as NotebookCellData)
      }
    })

    setCells(newCells)
    setTextSections(newTextSections)
    setNextOrder(Math.max(...allItems.map((item) => item.order)) + 1)

    console.log("[v0] Duplicated", selectedItems.length, "items")
  }

  const handleDelete = () => {
    if (selectionState.selectedCells.size === 0) return

    saveStateForUndo()

    const selectedIds = new Set(selectionState.selectedCells)
    const newCells = cells.filter((cell) => !selectedIds.has(cell.id))
    const newTextSections = textSections.filter((section) => !selectedIds.has(section.id))

    setCells(newCells)
    setTextSections(newTextSections)
    clearSelection()

    // Show confirmation toast (simplified for now)
    console.log("[v0] Deleted", selectedIds.size, "items - Ctrl+Z to undo")
  }

  const handleUndo = () => {
    if (undoHistory.length === 0) return

    const lastState = undoHistory[undoHistory.length - 1]
    setCells(lastState.cells)
    setTextSections(lastState.textSections)
    setUndoHistory((prev) => prev.slice(0, -1))
    clearSelection()

    console.log("[v0] Undid last action")
  }

  const handleClearAll = () => {
    saveStateForUndo()
    setCells([])
    setTextSections([])
    clearSelection()
    console.log("[v0] Cleared all cells and text sections")
  }

  const convertCellToText = (cellId: string) => {
    const cell = cells.find((c) => c.id === cellId)
    if (!cell) return

    const newTextSection: TextSectionData = {
      id: cellId, // Keep same ID to maintain position
      content: cell.content,
      order: cell.order || 0,
    }

    // Remove from cells and add to text sections
    setCells(cells.filter((c) => c.id !== cellId))
    setTextSections([...textSections, newTextSection])
  }

  const convertTextToCell = (textId: string, cellType: CellType = "python") => {
    const textSection = textSections.find((t) => t.id === textId)
    if (!textSection) return

    const newCell: NotebookCellData = {
      id: textId, // Keep same ID to maintain position
      type: cellType,
      content: textSection.content,
      metadata: { title: `Converted ${cellType} Cell` },
      order: textSection.order,
    }

    // Remove from text sections and add to cells
    setTextSections(textSections.filter((t) => t.id !== textId))
    setCells([...cells, newCell])
  }

  useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const allItemIds = items.map((item) => item.id)

      // Handle clipboard shortcuts first
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case "c":
            if (selectionState.selectedCells.size > 0) {
              e.preventDefault()
              handleCopy()
              return
            }
            break
          case "x":
            if (selectionState.selectedCells.size > 0) {
              e.preventDefault()
              handleCut()
              return
            }
            break
          case "v":
            e.preventDefault()
            handlePaste()
            return
          case "d":
            if (selectionState.selectedCells.size > 0) {
              e.preventDefault()
              handleDuplicate()
              return
            }
            break
          case "z":
            e.preventDefault()
            handleUndo()
            return
        }
      }

      // Handle delete keys
      if ((e.key === "Delete" || e.key === "Backspace") && selectionState.selectedCells.size > 0) {
        e.preventDefault()
        handleDelete()
        return
      }

      // Pass to selection handler for other keys
      handleKeyDown(e, allItemIds)
    }

    document.addEventListener("keydown", handleKeyDownEvent)
    return () => document.removeEventListener("keydown", handleKeyDownEvent)
  }, [handleKeyDown, items, selectionState.selectedCells, clipboardData, undoHistory])

  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey
    const isShift = e.shiftKey

    if (isCtrlOrCmd) {
      selectCell(cellId, false, true) // Toggle selection
    } else if (isShift) {
      selectCell(cellId, true, false) // Extend selection
    } else {
      selectCell(cellId, false, false) // Single selection
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <NotebookToolbar
        onExecuteAll={() => executeAllCells(cells)}
        onRestartKernel={restartKernel}
        onInterruptExecution={interruptExecution}
        onClearAll={handleClearAll}
        isExecuting={isExecuting}
      />

      <TitleBlock value={title} onChange={setTitle} placeholder="Untitled Notebook" />

      <div
        ref={containerRef}
        className="relative"
        onMouseDown={(e) => {
          // Only start marquee if clicking on empty space (not on a cell)
          const target = e.target as HTMLElement
          const isEmptySpace = !target.closest("[data-cell-id]") && !target.closest("[data-text-section-id]")

          if (isEmptySpace) {
            startMarqueeSelection(e.nativeEvent)
          }
        }}
        onMouseMove={(e) => {
          if (selectionState.isSelecting) {
            updateMarqueeSelection(e.nativeEvent)
          }
        }}
        onMouseUp={() => {
          if (selectionState.isSelecting) {
            endMarqueeSelection()
          }
        }}
        onMouseLeave={() => {
          if (selectionState.isSelecting) {
            endMarqueeSelection()
          }
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="notebook-items">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""} ${
                          snapshot.isDragging ? "transform rotate-1 scale-105" : ""
                        } ${
                          selectionState.selectedCells.has(item.id) && selectionState.selectedCells.size > 1
                            ? "ring-1 ring-gray-400/20 ring-dotted rounded-lg"
                            : ""
                        } ${
                          snapshot.isDragging &&
                          selectionState.selectedCells.size > 1 &&
                          selectionState.selectedCells.has(item.id)
                            ? "shadow-2xl shadow-blue-500/20"
                            : ""
                        }`}
                        id={item.type === "text" ? `text-section-${item.id}` : `cell-${item.id}`}
                        data-cell-id={item.id}
                        data-text-section-id={item.type === "text" ? item.id : undefined}
                        onClick={(e) => handleCellClick(item.id, e)}
                      >
                        {item.type === "text" ? (
                          <TextSection
                            value={(item.data as TextSectionData).content}
                            onChange={(content) => updateTextSection(item.id, content)}
                            placeholder="Type your text..."
                            dragHandleProps={provided.dragHandleProps}
                            onEmptyDelete={() => handleEmptyDelete(item.id, "text")}
                            onDelete={() => deleteTextSection(item.id)}
                            onDuplicate={() => duplicateTextSection(item.id)}
                            onLock={() => toggleTextSectionLock(item.id)}
                            onConvertToCode={() => convertTextToCell(item.id, "python")}
                            isLocked={(item.data as TextSectionData).isLocked || false}
                          />
                        ) : (
                          <NotebookCell
                            cell={item.data as NotebookCellData}
                            onUpdate={updateCell}
                            onDelete={deleteCell}
                            onDuplicate={duplicateCell}
                            onAddCell={addCell}
                            onExecute={handleExecuteCell}
                            onGenerateCells={handleGenerateCells}
                            onConvertToText={() => convertCellToText(item.id)}
                            dragHandleProps={provided.dragHandleProps}
                            onEmptyDelete={() => handleEmptyDelete(item.id, "cell")}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <SelectionOverlay selectionRect={selectionState.selectionRect} isSelecting={selectionState.isSelecting} />
      </div>

      {selectionState.selectedCells.size > 0 && (
        <FloatingSelectionToolbar
          selectedCount={selectionState.selectedCells.size}
          position={{ x: window.innerWidth / 2, y: 100 }}
          onCopy={handleCopy}
          onCut={handleCut}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onClear={clearSelection}
        />
      )}

      <BlockSeparator onAddCell={(type) => addCell(type)} onAddSeparator={(style) => handleAddSeparator(style)} />
    </div>
  )
}
