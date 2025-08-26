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

  // Clear selection
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
        // Ctrl/Cmd+Click: Toggle individual cell
        if (newSelected.has(cellId)) {
          newSelected.delete(cellId)
        } else {
          newSelected.add(cellId)
        }
        return {
          ...prev,
          selectedCells: newSelected,
          lastFocusedCell: cellId,
        }
      } else if (extend && prev.lastFocusedCell && allCellIds.length > 0) {
        // Shift+Click: Select range from last focused to current
        const lastIndex = allCellIds.indexOf(prev.lastFocusedCell)
        const currentIndex = allCellIds.indexOf(cellId)

        if (lastIndex !== -1 && currentIndex !== -1) {
          const startIndex = Math.min(lastIndex, currentIndex)
          const endIndex = Math.max(lastIndex, currentIndex)

          // Clear previous selection and select range
          newSelected.clear()
          for (let i = startIndex; i <= endIndex; i++) {
            newSelected.add(allCellIds[i])
          }
        } else {
          // Fallback: just add the current cell
          newSelected.add(cellId)
        }

        return {
          ...prev,
          selectedCells: newSelected,
          lastFocusedCell: cellId,
        }
      } else {
        // Single click: Select only this cell
        newSelected.clear()
        newSelected.add(cellId)
        return {
          ...prev,
          selectedCells: newSelected,
          lastFocusedCell: cellId,
        }
      }
    })
  }, [])

  // Select all cells
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
      selectedCells: new Set(), // Clear previous selection when starting marquee
    }))
  }, [])

  // Update marquee selection
  const updateMarqueeSelection = useCallback((e: MouseEvent) => {
    if (!isMouseDownRef.current || !startPointRef.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const x = Math.min(startPointRef.current.x, currentX)
    const y = Math.min(startPointRef.current.y, currentY)
    const width = Math.abs(currentX - startPointRef.current.x)
    const height = Math.abs(currentY - startPointRef.current.y)

    setSelectionState((prev) => ({
      ...prev,
      selectionRect: { x, y, width, height },
    }))

    const cellElements = containerRef.current.querySelectorAll("[data-cell-id]")
    const intersectingCells = new Set<string>()

    cellElements.forEach((element) => {
      const cellRect = element.getBoundingClientRect()
      const containerRect = containerRef.current!.getBoundingClientRect()

      const cellX = cellRect.left - containerRect.left
      const cellY = cellRect.top - containerRect.top
      const cellWidth = cellRect.width
      const cellHeight = cellRect.height

      // More precise intersection check - cells must have meaningful overlap
      const overlapX = Math.max(0, Math.min(x + width, cellX + cellWidth) - Math.max(x, cellX))
      const overlapY = Math.max(0, Math.min(y + height, cellY + cellHeight) - Math.max(y, cellY))
      const overlapArea = overlapX * overlapY
      const cellArea = cellWidth * cellHeight

      // Cell is selected if overlap is at least 10% of cell area or selection covers at least 50% of cell
      if (overlapArea > 0 && (overlapArea / cellArea > 0.1 || overlapArea / (width * height) > 0.5)) {
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

  // End marquee selection
  const endMarqueeSelection = useCallback(() => {
    isMouseDownRef.current = false
    startPointRef.current = null

    setSelectionState((prev) => ({
      ...prev,
      isSelecting: false,
      selectionRect: null,
    }))
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, allCellIds: string[]) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      switch (e.key) {
        case "Escape":
          e.preventDefault()
          clearSelection()
          break
        case "a":
          if (isCtrlOrCmd) {
            e.preventDefault()
            selectAll(allCellIds)
          }
          break
        case "ArrowUp":
        case "ArrowDown":
          if (selectionState.lastFocusedCell && allCellIds.length > 0) {
            e.preventDefault()
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

              // Scroll to the newly focused cell
              setTimeout(() => {
                const element = document.querySelector(`[data-cell-id="${newCellId}"]`)
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              }, 0)
            }
          }
          break
        case "c":
          if (isCtrlOrCmd && selectionState.selectedCells.size > 0) {
            e.preventDefault()
            // Copy logic will be implemented later
          }
          break
        case "x":
          if (isCtrlOrCmd && selectionState.selectedCells.size > 0) {
            e.preventDefault()
            // Cut logic will be implemented later
          }
          break
        case "v":
          if (isCtrlOrCmd) {
            e.preventDefault()
            // Paste logic will be implemented later
          }
          break
        case "d":
          if (isCtrlOrCmd && selectionState.selectedCells.size > 0) {
            e.preventDefault()
            // Duplicate logic will be implemented later
          }
          break
        case "Delete":
        case "Backspace":
          if (selectionState.selectedCells.size > 0) {
            e.preventDefault()
            // Delete logic will be implemented later
          }
          break
      }
    },
    [selectionState.selectedCells, selectionState.lastFocusedCell, clearSelection, selectAll, selectCell],
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
