"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { NotebookCell } from "../notebook-cell"
import { NotebookToolbar } from "../notebook-toolbar"
import { TitleBlock } from "../title-block"
import { TextSection } from "../text-section"
import { BlockSeparator } from "../block-separator"
import { SelectionOverlay } from "../selection-overlay"
import { FloatingSelectionToolbar } from "../floating-selection-toolbar"
import { useCellSelection } from "@/hooks/use-cell-selection"
import { useNotebookEngine } from "@/hooks/use-notebook-engine"
import type { CellType, NotebookCellData } from "@/types/notebook"

import {
  combineIntoItems,
  separateItems,
  calculateNextOrder,
  type NotebookItem,
  type TextSectionData,
} from "./NotebookItems"
import { useNotebookReorder } from "./useNotebookReorder"
import { useNotebookClipboard } from "./useNotebookClipboard"
import { useNotebookCells } from "./useNotebookCells"
import { useNotebookTextSections } from "./useNotebookTextSections"
import { useUndoHistory } from "./useUndoHistory"

interface NotebookEditorProps {
  initialCells?: NotebookCellData[]
  initialTitle?: string
  initialTextSections?: TextSectionData[]
  onCellsChange?: (cells: NotebookCellData[]) => void
  onTitleChange?: (title: string) => void
  onTextSectionsChange?: (textSections: TextSectionData[]) => void
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
  const initializedRef = useRef(false)

  const { executeCell, executeAllCells, isExecuting, restartKernel, interruptExecution } = useNotebookEngine()
  const { saveStateForUndo, undo, canUndo } = useUndoHistory()

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

  const items = combineIntoItems(cells, textSections)

  useEffect(() => {
    if (!initializedRef.current) {
      const allItems = [...initialCells, ...initialTextSections]
      const maxOrder = allItems.length > 0 ? Math.max(...allItems.map((item) => item.order || 0)) : -1
      setNextOrder(maxOrder + 1)
      initializedRef.current = true
    }
  }, [])

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

  const handleItemsChange = useCallback((newCells: NotebookCellData[], newTextSections: TextSectionData[]) => {
    setCells(newCells)
    setTextSections(newTextSections)
    setNextOrder(calculateNextOrder(combineIntoItems(newCells, newTextSections)))
  }, [])

  const handleItemsInsert = useCallback(
    (newItems: NotebookItem[], insertionIndex: number) => {
      saveStateForUndo(cells, textSections)

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

      // Combine all items and separate
      const allItems = [...updatedItems, ...newItems].sort((a, b) => a.order - b.order)
      const { cells: newCells, textSections: newTextSections } = separateItems(allItems)

      handleItemsChange(newCells, newTextSections)
    },
    [items, cells, textSections, saveStateForUndo, handleItemsChange],
  )

  const handleItemsRemove = useCallback(
    (itemIds: Set<string>) => {
      saveStateForUndo(cells, textSections)

      const newCells = cells.filter((cell) => !itemIds.has(cell.id))
      const newTextSections = textSections.filter((section) => !itemIds.has(section.id))

      handleItemsChange(newCells, newTextSections)
    },
    [cells, textSections, saveStateForUndo, handleItemsChange],
  )

  const { handleDragEnd, handleMoveUp, handleMoveDown } = useNotebookReorder({
    items,
    selectedCells: selectionState.selectedCells,
    onItemsChange: handleItemsChange,
  })

  const { handleCopy, handleCut, handlePaste, handleDuplicate } = useNotebookClipboard({
    items,
    selectedCells: selectionState.selectedCells,
    lastFocusedCell: selectionState.lastFocusedCell,
    onItemsInsert: handleItemsInsert,
    onItemsRemove: handleItemsRemove,
    clearSelection,
  })

  const { addCell, updateCell, deleteCell, duplicateCell, handleGenerateCells } = useNotebookCells({
    cells,
    nextOrder,
    onCellsChange: setCells,
    onOrderChange: setNextOrder,
  })

  const { addTextSection, updateTextSection, deleteTextSection, duplicateTextSection, toggleTextSectionLock } =
    useNotebookTextSections({
      textSections,
      nextOrder,
      onTextSectionsChange: setTextSections,
      onOrderChange: setNextOrder,
    })

  const handleAddCell = useCallback(
    (type: CellType) => {
      if (type === "text") {
        addTextSection()
      } else {
        addCell(type)
      }
    },
    [addCell, addTextSection],
  )

  const handleExecuteCell = useCallback(
    async (cell: NotebookCellData) => {
      const result = await executeCell(cell)
      if (result.success && result.output) {
        updateCell(cell.id, { output: result.output })
      }
    },
    [executeCell, updateCell],
  )

  const handleDelete = useCallback(() => {
    if (selectionState.selectedCells.size === 0) return

    saveStateForUndo(cells, textSections)
    handleItemsRemove(selectionState.selectedCells)
    clearSelection()

    console.log("[v0] Deleted", selectionState.selectedCells.size, "items - Ctrl+Z to undo")
  }, [selectionState.selectedCells, cells, textSections, saveStateForUndo, handleItemsRemove, clearSelection])

  const handleUndo = useCallback(() => {
    const previousState = undo()
    if (previousState) {
      handleItemsChange(previousState.cells, previousState.textSections)
      clearSelection()
      console.log("[v0] Undid last action")
    }
  }, [undo, handleItemsChange, clearSelection])

  const handleClearAll = useCallback(() => {
    saveStateForUndo(cells, textSections)
    handleItemsChange([], [])
    clearSelection()
    console.log("[v0] Cleared all cells and text sections")
  }, [cells, textSections, saveStateForUndo, handleItemsChange, clearSelection])

  const handleEmptyDelete = useCallback(
    (id: string, type: "cell" | "text") => {
      if (type === "cell") {
        deleteCell(id)
      } else {
        deleteTextSection(id)
      }
    },
    [deleteCell, deleteTextSection],
  )

  const handleAddSeparator = useCallback((style: string) => {
    // Implementation for adding separator
  }, [])

  const convertCellToText = useCallback(
    (cellId: string) => {
      const cell = cells.find((c) => c.id === cellId)
      if (!cell) return

      const newTextSection: TextSectionData = {
        id: cellId, // Keep same ID to maintain position
        content: cell.content,
        order: cell.order || 0,
      }

      setCells(cells.filter((c) => c.id !== cellId))
      setTextSections([...textSections, newTextSection])
    },
    [cells, textSections],
  )

  const convertTextToCell = useCallback(
    (textId: string, cellType: CellType = "python") => {
      const textSection = textSections.find((t) => t.id === textId)
      if (!textSection) return

      const newCell: NotebookCellData = {
        id: textId, // Keep same ID to maintain position
        type: cellType,
        content: textSection.content,
        metadata: { title: `Converted ${cellType} Cell` },
        order: textSection.order,
      }

      setTextSections(textSections.filter((t) => t.id !== textId))
      setCells([...cells, newCell])
    },
    [textSections, cells],
  )

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
  }, [
    handleKeyDown,
    items,
    selectionState.selectedCells,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleUndo,
    handleDelete,
  ])

  const handleCellClick = useCallback(
    (cellId: string, e: React.MouseEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      if (isCtrlOrCmd) {
        selectCell(cellId, false, true) // Toggle selection
      } else if (isShift) {
        selectCell(cellId, true, false) // Extend selection
      } else {
        selectCell(cellId, false, false) // Single selection
      }
    },
    [selectCell],
  )

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

      <BlockSeparator onAddCell={handleAddCell} onAddSeparator={(style) => handleAddSeparator(style)} />
    </div>
  )
}
