"use client"

import { useState, useCallback, useRef } from "react"

interface TextSectionData {
  id: string
  content: string
  order: number
  isLocked?: boolean
}

interface SelectionState {
  selectedCells: Set<string>
  lastFocusedCell: string | null
  isSelecting: boolean
  selectionRect: { x: number; y: number; width: number; height: number } | null
}

const createSelectionRect = (startX: number, startY: number, currentX: number, currentY: number) => ({
  x: Math.min(startX, currentX),
  y: Math.min(startY, currentY),
  width: Math.abs(currentX - startX),
  height: Math.abs(currentY - startY),
})

const calculateCellOverlap = (selectionRect: any, cellRect: DOMRect, containerRect: DOMRect) => {
  const cellX = cellRect.left - containerRect.left
  const cellY = cellRect.top - containerRect.top
  const cellWidth = cellRect.width
  const cellHeight = cellRect.height

  const overlapX = Math.max(
    0,
    Math.min(selectionRect.x + selectionRect.width, cellX + cellWidth) - Math.max(selectionRect.x, cellX),
  )
  const overlapY = Math.max(
    0,
    Math.min(selectionRect.y + selectionRect.height, cellY + cellHeight) - Math.max(selectionRect.y, cellY),
  )
  const overlapArea = overlapX * overlapY
  const cellArea = cellWidth * cellHeight

  return (
    overlapArea > 0 &&
    (overlapArea / cellArea > 0.1 || overlapArea / (selectionRect.width * selectionRect.height) > 0.5)
  )
}

export function useCellSelection() {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedCells: new Set(),
    lastFocusedCell: null,
    isSelecting: false,
    selectionRect: null,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const isMouseDownRef = useRef(false)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)

  const clearSelection = useCallback(() => {
    setSelectionState((prev) => ({
      ...prev,
      selectedCells: new Set(),
      lastFocusedCell: null,
      isSelecting: false,
      selectionRect: null,
    }))
  }, [])

  const selectCell = useCallback((cellId: string, extend = false, toggle = false, allCellIds: string[] = []) => {
    setSelectionState((prev) => {
      const newSelected = new Set(prev.selectedCells)

      if (toggle) {
        if (newSelected.has(cellId)) {
          newSelected.delete(cellId)
        } else {
          newSelected.add(cellId)
        }
        return { ...prev, selectedCells: newSelected, lastFocusedCell: cellId }
      }

      if (extend && prev.lastFocusedCell && allCellIds.length > 0) {
        const lastIndex = allCellIds.indexOf(prev.lastFocusedCell)
        const currentIndex = allCellIds.indexOf(cellId)

        if (lastIndex !== -1 && currentIndex !== -1) {
          const startIndex = Math.min(lastIndex, currentIndex)
          const endIndex = Math.max(lastIndex, currentIndex)

          newSelected.clear()
          for (let i = startIndex; i <= endIndex; i++) {
            newSelected.add(allCellIds[i])
          }
        } else {
          newSelected.add(cellId)
        }

        return { ...prev, selectedCells: newSelected, lastFocusedCell: cellId }
      }

      newSelected.clear()
      newSelected.add(cellId)
      return { ...prev, selectedCells: newSelected, lastFocusedCell: cellId }
    })
  }, [])

  const selectAll = useCallback((allCellIds: string[]) => {
    setSelectionState((prev) => ({
      ...prev,
      selectedCells: new Set(allCellIds),
      lastFocusedCell: allCellIds[allCellIds.length - 1] || null,
    }))
  }, [])

  const startMarqueeSelection = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    startPointRef.current = { x: startX, y: startY }
    isMouseDownRef.current = true

    setSelectionState((prev) => ({
      ...prev,
      isSelecting: true,
      selectionRect: { x: startX, y: startY, width: 0, height: 0 },
      selectedCells: new Set(),
    }))
  }, [])

  const updateMarqueeSelection = useCallback((e: MouseEvent) => {
    if (!isMouseDownRef.current || !startPointRef.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const selectionRect = createSelectionRect(startPointRef.current.x, startPointRef.current.y, currentX, currentY)

    setSelectionState((prev) => ({ ...prev, selectionRect }))

    const cellElements = containerRef.current.querySelectorAll("[data-cell-id]")
    const intersectingCells = new Set<string>()

    cellElements.forEach((element) => {
      const cellRect = element.getBoundingClientRect()
      const containerRect = containerRef.current!.getBoundingClientRect()

      if (calculateCellOverlap(selectionRect, cellRect, containerRect)) {
        const cellId = element.getAttribute("data-cell-id")
        if (cellId) intersectingCells.add(cellId)
      }
    })

    setSelectionState((prev) => ({
      ...prev,
      selectedCells: intersectingCells,
      lastFocusedCell:
        intersectingCells.size > 0 ? Array.from(intersectingCells)[intersectingCells.size - 1] : prev.lastFocusedCell,
    }))
  }, [])

  const endMarqueeSelection = useCallback(() => {
    isMouseDownRef.current = false
    startPointRef.current = null

    setSelectionState((prev) => ({
      ...prev,
      isSelecting: false,
      selectionRect: null,
    }))
  }, [])

  const handleArrowNavigation = useCallback(
    (e: KeyboardEvent, allCellIds: string[], isShift: boolean) => {
      if (!selectionState.lastFocusedCell || allCellIds.length === 0) return false

      const currentIndex = allCellIds.indexOf(selectionState.lastFocusedCell)
      let newIndex = currentIndex

      if (e.key === "ArrowUp" && currentIndex > 0) {
        newIndex = currentIndex - 1
      } else if (e.key === "ArrowDown" && currentIndex < allCellIds.length - 1) {
        newIndex = currentIndex + 1
      }

      if (newIndex !== currentIndex) {
        const newCellId = allCellIds[newIndex]
        selectCell(newCellId, isShift, false, allCellIds)

        setTimeout(() => {
          const element = document.querySelector(`[data-cell-id="${newCellId}"]`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 0)
        return true
      }
      return false
    },
    [selectionState.lastFocusedCell, selectCell],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, allCellIds: string[]) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      if (e.key === "Escape") {
        e.preventDefault()
        clearSelection()
        return
      }

      if (e.key === "a" && isCtrlOrCmd) {
        e.preventDefault()
        selectAll(allCellIds)
        return
      }

      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && handleArrowNavigation(e, allCellIds, isShift)) {
        e.preventDefault()
        return
      }

      // Handle other shortcuts (copy, cut, paste, duplicate, delete)
      if (selectionState.selectedCells.size > 0) {
        const shortcuts = ["c", "x", "v", "d", "Delete", "Backspace"]
        if ((isCtrlOrCmd && shortcuts.slice(0, 4).includes(e.key)) || shortcuts.slice(4).includes(e.key)) {
          e.preventDefault()
          // Logic will be handled by parent component
        }
      }
    },
    [selectionState.selectedCells, clearSelection, selectAll, handleArrowNavigation],
  )

  return {
    selectionState,
    containerRef,
    selectCell,
    selectAll,
    clearSelection,
    startMarqueeSelection,
    updateMarqueeSelection,
    endMarqueeSelection,
    handleKeyDown,
  }
}
