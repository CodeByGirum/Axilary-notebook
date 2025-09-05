"use client"

import type React from "react"

import { useCallback, useRef } from "react"

interface SelectionHandlers {
  handleClick: (view: any, pos: number, event: MouseEvent) => boolean
  handleMouseDown: (view: any, event: MouseEvent) => boolean
  handleMouseMove: (view: any, event: MouseEvent) => boolean
  handleMouseUp: (view: any, event: MouseEvent) => boolean
  handleMouseLeave: (view: any, event: MouseEvent) => boolean
  handleDoubleClick: (view: any, event: MouseEvent) => boolean
}

interface SelectionState {
  isDragging: boolean
  dragStartPos: number | null
  dragDeleteMode: boolean
  selectionDirection: "forward" | "backward"
  wordBoundarySnap: boolean
  lastDragPos: number | null
  clickCount: number
  lastClickTime: number
}

/**
 * Manages text selection and mouse handlers with requestAnimationFrame throttling
 */
export function useRichTextSelection(
  selectionState: SelectionState,
  setSelectionState: (updates: Partial<SelectionState>) => void,
  multiSelections: Array<{ from: number; to: number }>,
  setMultiSelections: (selections: Array<{ from: number; to: number }>) => void,
  editorRef: React.RefObject<HTMLDivElement>,
  findWordBoundary: (doc: any, pos: number, direction: "start" | "end") => number,
  createSmartSelection: (
    view: any,
    startPos: number,
    endPos: number,
    snapToWords?: boolean,
  ) => { from: number; to: number; direction: "forward" | "backward" },
): SelectionHandlers {
  const rafRef = useRef<number>()

  const throttledMouseMove = useCallback(
    (view: any, event: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!selectionState.isDragging || selectionState.dragStartPos === null) return

        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (!pos) return

        const { from, to, direction } = createSmartSelection(
          view,
          selectionState.dragStartPos,
          pos.pos,
          selectionState.wordBoundarySnap,
        )

        if (selectionState.lastDragPos !== pos.pos) {
          setSelectionState({ lastDragPos: pos.pos })

          if (from !== to) {
            view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)))

            const editorElement = view.dom as HTMLElement
            editorElement.style.cursor = direction === "forward" ? "text" : "w-resize"
          }
        }
      })
    },
    [
      selectionState.isDragging,
      selectionState.dragStartPos,
      selectionState.wordBoundarySnap,
      selectionState.lastDragPos,
      createSmartSelection,
      setSelectionState,
    ],
  )

  const handleClick = useCallback(
    (view: any, pos: number, event: MouseEvent) => {
      const now = Date.now()
      const timeDiff = now - selectionState.lastClickTime

      // Handle click outside text but within editor area
      const clickedElement = event.target as HTMLElement
      if (clickedElement && editorRef.current?.contains(clickedElement)) {
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (coords) {
          view.dispatch(
            view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(coords.pos))),
          )
          view.focus()
        }
      }

      // Handle multi-selection with Ctrl/Cmd
      if (event.ctrlKey || event.metaKey) {
        const { selection } = view.state
        if (!selection.empty) {
          setMultiSelections([...multiSelections, { from: selection.from, to: selection.to }])
        }
        return true
      }

      // Handle triple-click for paragraph selection
      if (timeDiff < 500) {
        setSelectionState({ clickCount: selectionState.clickCount + 1 })
      } else {
        setSelectionState({ clickCount: 1 })
      }
      setSelectionState({ lastClickTime: now })

      if (selectionState.clickCount === 2) {
        const $pos = view.state.doc.resolve(pos)
        const start = $pos.start($pos.depth)
        const end = $pos.end($pos.depth)
        view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, start, end)))
        return true
      }

      // Handle Shift-click for range selection
      if (event.shiftKey) {
        const { selection } = view.state
        const from = Math.min(selection.from, pos)
        const to = Math.max(selection.to, pos)
        view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)))
        return true
      }

      view.focus()
      return false
    },
    [
      selectionState.lastClickTime,
      selectionState.clickCount,
      editorRef,
      multiSelections,
      setMultiSelections,
      setSelectionState,
    ],
  )

  const handleMouseDown = useCallback(
    (view: any, event: MouseEvent) => {
      if (event.button !== 0) return false

      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
      if (!pos) return false

      const isDoubleClick = event.detail === 2
      const wordBoundarySnap = isDoubleClick || event.ctrlKey || event.metaKey

      setSelectionState({
        isDragging: true,
        dragStartPos: pos.pos,
        lastDragPos: pos.pos,
        dragDeleteMode: event.altKey,
        wordBoundarySnap,
      })

      view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(pos.pos))))

      return false
    },
    [setSelectionState],
  )

  const handleMouseMove = useCallback(
    (view: any, event: MouseEvent) => {
      throttledMouseMove(view, event)
      return selectionState.isDragging
    },
    [throttledMouseMove, selectionState.isDragging],
  )

  const handleMouseUp = useCallback(
    (view: any, event: MouseEvent) => {
      if (!selectionState.isDragging) return false

      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
      if (pos && selectionState.dragStartPos !== null) {
        const { from, to } = createSmartSelection(
          view,
          selectionState.dragStartPos,
          pos.pos,
          selectionState.wordBoundarySnap,
        )

        if (from !== to) {
          view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, from, to)))
        }
      }

      // Handle drag deletion if Alt was pressed
      if (selectionState.dragDeleteMode) {
        const { selection } = view.state
        if (!selection.empty) {
          view.dispatch(view.state.tr.deleteSelection())
        }
      }

      setSelectionState({
        isDragging: false,
        dragStartPos: null,
        lastDragPos: null,
        dragDeleteMode: false,
        wordBoundarySnap: false,
      })

      const editorElement = view.dom as HTMLElement
      editorElement.style.cursor = "text"

      return false
    },
    [
      selectionState.isDragging,
      selectionState.dragStartPos,
      selectionState.wordBoundarySnap,
      selectionState.dragDeleteMode,
      createSmartSelection,
      setSelectionState,
    ],
  )

  const handleMouseLeave = useCallback(
    (view: any, event: MouseEvent) => {
      if (selectionState.isDragging) {
        setSelectionState({
          isDragging: false,
          dragStartPos: null,
          lastDragPos: null,
          dragDeleteMode: false,
          wordBoundarySnap: false,
        })

        const editorElement = view.dom as HTMLElement
        editorElement.style.cursor = "text"
      }
      return false
    },
    [selectionState.isDragging, setSelectionState],
  )

  const handleDoubleClick = useCallback(
    (view: any, event: MouseEvent) => {
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
      if (!pos) return false

      const docSize = view.state.doc.content.size
      const safePos = Math.max(0, Math.min(pos.pos, docSize))

      try {
        const wordStart = findWordBoundary(view.state.doc, safePos, "start")
        const wordEnd = findWordBoundary(view.state.doc, safePos, "end")

        const boundedStart = Math.max(0, Math.min(wordStart, docSize))
        const boundedEnd = Math.max(0, Math.min(wordEnd, docSize))

        view.dispatch(
          view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, boundedStart, boundedEnd)),
        )
      } catch (error) {
        console.warn("[v0] Double-click word selection failed, falling back to character selection:", error)
        view.dispatch(
          view.state.tr.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(safePos))),
        )
      }

      return true
    },
    [findWordBoundary],
  )

  return {
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDoubleClick,
  }
}
