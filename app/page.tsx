"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { NotebookEditor } from "@/components/notebook/editor/NotebookEditor"
import { NotebookPublisher } from "@/components/notebook/notebook-publisher"
import { Sidebar } from "@/components/sidebar/sidebar"
import { PageHeader } from "@/components/page-header"
import { NotebookPublishSection } from "@/components/notebook/notebook-publish-section"
import type { NotebookCellData } from "@/types/notebook"

function useNotebookState() {
  const [cells, setCells] = useState<NotebookCellData[]>([])
  const [title, setTitle] = useState("Welcome to Axilary Notebook")
  const [textSections, setTextSections] = useState<any[]>([])
  const [separators, setSeparators] = useState<any[]>([])

  return {
    cells,
    setCells,
    title,
    setTitle,
    textSections,
    setTextSections,
    separators,
    setSeparators,
  }
}

function useHistoryState() {
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = useCallback(
    (newCells: NotebookCellData[], newTitle: string, newTextSections: any[], newSeparators: any[]) => {
      const newState = { cells: newCells, title: newTitle, textSections: newTextSections, separators: newSeparators }
      setHistory((prev) => {
        const newHistory = [...prev.slice(0, historyIndex + 1), newState]
        return newHistory.slice(-50)
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  return { history, historyIndex, setHistoryIndex, saveToHistory, setHistory }
}

function useSidebarState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)

  const effectiveSidebarOpen = !isSidebarCollapsed || isSidebarHovered
  const effectiveSidebarWidth = effectiveSidebarOpen ? sidebarWidth : 48

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isSidebarHovered,
    setIsSidebarHovered,
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    setIsResizing,
    effectiveSidebarOpen,
    effectiveSidebarWidth,
  }
}

export default function NotebookPage() {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "publish">("edit")
  const { cells, setCells, title, setTitle, textSections, setTextSections, separators, setSeparators } =
    useNotebookState()
  const { history, historyIndex, setHistoryIndex, saveToHistory } = useHistoryState()
  const sidebarState = useSidebarState()

  useEffect(() => {
    const loadFromStorage = () => {
      const savedCells = localStorage.getItem("notebook-cells")
      const savedTitle = localStorage.getItem("notebook-title")
      const savedTextSections = localStorage.getItem("notebook-text-sections")
      const savedSeparators = localStorage.getItem("notebook-separators")
      const savedSidebarWidth = localStorage.getItem("sidebar-width")
      const savedSidebarCollapsed = localStorage.getItem("sidebar-collapsed")

      if (savedCells) setCells(JSON.parse(savedCells))
      if (savedTitle) setTitle(savedTitle)
      if (savedTextSections) setTextSections(JSON.parse(savedTextSections))
      if (savedSeparators) setSeparators(JSON.parse(savedSeparators))
      if (savedSidebarWidth) sidebarState.setSidebarWidth(Number.parseInt(savedSidebarWidth))
      if (savedSidebarCollapsed) sidebarState.setIsSidebarCollapsed(JSON.parse(savedSidebarCollapsed))
    }

    loadFromStorage()
  }, [])

  const handleGlobalUndo = useCallback(() => {
    if (historyIndex <= 0) return

    const prevState = history[historyIndex - 1]
    setCells(prevState.cells)
    setTitle(prevState.title)
    setTextSections(prevState.textSections)
    setSeparators(prevState.separators || [])
    setHistoryIndex(historyIndex - 1)

    localStorage.setItem("notebook-cells", JSON.stringify(prevState.cells))
    localStorage.setItem("notebook-title", prevState.title)
    localStorage.setItem("notebook-text-sections", JSON.stringify(prevState.textSections))
    localStorage.setItem("notebook-separators", JSON.stringify(prevState.separators || []))
  }, [historyIndex, history])

  const handleGlobalRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return

    const nextState = history[historyIndex + 1]
    setCells(nextState.cells)
    setTitle(nextState.title)
    setTextSections(nextState.textSections)
    setSeparators(nextState.separators || [])
    setHistoryIndex(historyIndex + 1)

    localStorage.setItem("notebook-cells", JSON.stringify(nextState.cells))
    localStorage.setItem("notebook-title", nextState.title)
    localStorage.setItem("notebook-text-sections", JSON.stringify(nextState.textSections))
    localStorage.setItem("notebook-separators", JSON.stringify(nextState.separators || []))
  }, [historyIndex, history])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleGlobalUndo()
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault()
        handleGlobalRedo()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleGlobalUndo, handleGlobalRedo])

  const handleCellsChange = useCallback(
    (newCells: NotebookCellData[]) => {
      setCells(newCells)
      localStorage.setItem("notebook-cells", JSON.stringify(newCells))
      saveToHistory(newCells, title, textSections, separators)
    },
    [title, textSections, separators, saveToHistory],
  )

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)
      localStorage.setItem("notebook-title", newTitle)
      saveToHistory(cells, newTitle, textSections, separators)
    },
    [cells, textSections, separators, saveToHistory],
  )

  const handleTextSectionsChange = useCallback(
    (newTextSections: any[]) => {
      setTextSections(newTextSections)
      localStorage.setItem("notebook-text-sections", JSON.stringify(newTextSections))
      saveToHistory(cells, title, newTextSections, separators)
    },
    [cells, title, separators, saveToHistory],
  )

  const handleSeparatorsChange = useCallback(
    (newSeparators: any[]) => {
      setSeparators(newSeparators)
      localStorage.setItem("notebook-separators", JSON.stringify(newSeparators))
      saveToHistory(cells, title, textSections, newSeparators)
    },
    [cells, title, textSections, saveToHistory],
  )

  const actionHandlers = {
    share: () => {
      if (navigator.share) {
        navigator.share({
          title: "Notebook Analysis",
          text: "Check out this data analysis",
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
      }
    },
    export: () => {
      const dataStr = JSON.stringify(cells, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "notebook-export.json"
      link.click()
      URL.revokeObjectURL(url)
    },
    runAll: () => console.log("Running all cells..."),
    run: () => console.log("Running current cell..."),
    goToPreview: () => setViewMode("preview"),
    goToPublish: () => setViewMode("publish"),
    goToEdit: () => setViewMode("edit"),
  }

  const sidebarHandlers = {
    toggle: () => {
      const newCollapsedState = !sidebarState.isSidebarCollapsed
      sidebarState.setIsSidebarCollapsed(newCollapsedState)
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsedState))
    },
    mouseEnter: () => {
      if (sidebarState.isSidebarCollapsed) {
        sidebarState.setIsSidebarHovered(true)
        sidebarState.setIsSidebarOpen(true)
      }
    },
    mouseLeave: () => {
      if (sidebarState.isSidebarCollapsed) {
        sidebarState.setIsSidebarHovered(false)
        sidebarState.setIsSidebarOpen(false)
      }
    },
    resizeStart: useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      sidebarState.setIsResizing(true)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }, []),
  }

  useEffect(() => {
    if (!sidebarState.isResizing) return

    const handleResizeMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(600, e.clientX))
      sidebarState.setSidebarWidth(newWidth)
    }

    const handleResizeEnd = () => {
      sidebarState.setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      localStorage.setItem("sidebar-width", sidebarState.sidebarWidth.toString())
    }

    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
    return () => {
      document.removeEventListener("mousemove", handleResizeMove)
      document.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [sidebarState.isResizing, sidebarState.sidebarWidth])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      <Sidebar
        isOpen={sidebarState.effectiveSidebarOpen}
        isCollapsed={sidebarState.isSidebarCollapsed}
        width={sidebarState.sidebarWidth}
        onClose={() => {
          sidebarState.setIsSidebarOpen(false)
          sidebarState.setIsSidebarHovered(false)
        }}
        onToggle={sidebarHandlers.toggle}
        onMouseEnter={sidebarHandlers.mouseEnter}
        onMouseLeave={sidebarHandlers.mouseLeave}
        onResizeStart={sidebarHandlers.resizeStart}
        isResizing={sidebarState.isResizing}
      />

      <div className="flex-1 flex flex-col transition-all duration-300">
        <PageHeader
          effectiveSidebarWidth={sidebarState.effectiveSidebarWidth}
          viewMode={viewMode}
          historyIndex={historyIndex}
          historyLength={history.length}
          onSidebarToggle={sidebarHandlers.toggle}
          onUndo={handleGlobalUndo}
          onRedo={handleGlobalRedo}
          onRun={actionHandlers.run}
          onRunAll={actionHandlers.runAll}
          onShare={actionHandlers.share}
          onExport={actionHandlers.export}
          onGoToPreview={actionHandlers.goToPreview}
          onGoToPublish={actionHandlers.goToPublish}
          onGoToEdit={actionHandlers.goToEdit}
          isSidebarCollapsed={sidebarState.isSidebarCollapsed}
        />

        <main
          className="pt-16 flex-1 transition-all duration-300"
          style={{ marginLeft: `${sidebarState.effectiveSidebarWidth}px` }}
        >
          <div className={cn("transition-all duration-300", viewMode !== "edit" ? "py-12 px-6" : "p-10")}>
            {viewMode === "edit" && (
              <NotebookEditor
                initialCells={cells}
                initialTitle={title}
                initialTextSections={textSections}
                initialSeparators={separators}
                onCellsChange={handleCellsChange}
                onTitleChange={handleTitleChange}
                onTextSectionsChange={handleTextSectionsChange}
                onSeparatorsChange={handleSeparatorsChange}
              />
            )}
            {viewMode === "preview" && (
              <NotebookPublisher cells={cells} title={title} textSections={textSections} separators={separators} />
            )}
            {viewMode === "publish" && (
              <NotebookPublishSection
                cells={cells}
                title={title}
                textSections={textSections}
                separators={separators}
                onShare={actionHandlers.share}
                onExport={actionHandlers.export}
                onGoToPreview={actionHandlers.goToPreview}
                onGoToEdit={actionHandlers.goToEdit}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
