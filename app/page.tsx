"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { NotebookEditor } from "@/components/notebook/editor/NotebookEditor"
import { NotebookPublisher } from "@/components/notebook/notebook-publisher"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Share, Download, Menu, Play, PlayCircle, Undo, Redo } from "lucide-react"
import type { NotebookCellData } from "@/types/notebook"

export default function NotebookPage() {
  const [isPublishMode, setIsPublishMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Default to expanded
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [cells, setCells] = useState<NotebookCellData[]>([])
  const [title, setTitle] = useState("Welcome to Axilary Notebook")
  const [textSections, setTextSections] = useState<any[]>([])

  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const saveToHistory = (newCells: NotebookCellData[], newTitle: string, newTextSections: any[]) => {
    const newState = { cells: newCells, title: newTitle, textSections: newTextSections }
    setHistory((prev) => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newState]
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex((prev) => prev + 1)
  }

  const handleGlobalUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setCells(prevState.cells)
      setTitle(prevState.title)
      setTextSections(prevState.textSections)
      setHistoryIndex(historyIndex - 1)

      localStorage.setItem("notebook-cells", JSON.stringify(prevState.cells))
      localStorage.setItem("notebook-title", prevState.title)
      localStorage.setItem("notebook-text-sections", JSON.stringify(prevState.textSections))
    }
  }

  const handleGlobalRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setCells(nextState.cells)
      setTitle(nextState.title)
      setTextSections(nextState.textSections)
      setHistoryIndex(historyIndex + 1)

      localStorage.setItem("notebook-cells", JSON.stringify(nextState.cells))
      localStorage.setItem("notebook-title", nextState.title)
      localStorage.setItem("notebook-text-sections", JSON.stringify(nextState.textSections))
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleGlobalUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        handleGlobalRedo()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [history, historyIndex])

  useEffect(() => {
    const savedCells = localStorage.getItem("notebook-cells")
    const savedTitle = localStorage.getItem("notebook-title")
    const savedTextSections = localStorage.getItem("notebook-text-sections")
    const savedSidebarWidth = localStorage.getItem("sidebar-width")
    const savedSidebarCollapsed = localStorage.getItem("sidebar-collapsed")

    if (savedCells) setCells(JSON.parse(savedCells))
    if (savedTitle) setTitle(savedTitle)
    if (savedTextSections) setTextSections(JSON.parse(savedTextSections))
    if (savedSidebarWidth) setSidebarWidth(Number.parseInt(savedSidebarWidth))
    if (savedSidebarCollapsed) setIsSidebarCollapsed(JSON.parse(savedSidebarCollapsed))
  }, [])

  const handleCellsChange = (newCells: NotebookCellData[]) => {
    setCells(newCells)
    localStorage.setItem("notebook-cells", JSON.stringify(newCells))
    saveToHistory(newCells, title, textSections)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    localStorage.setItem("notebook-title", newTitle)
    saveToHistory(cells, newTitle, textSections)
  }

  const handleTextSectionsChange = (newTextSections: any[]) => {
    setTextSections(newTextSections)
    localStorage.setItem("notebook-text-sections", JSON.stringify(newTextSections))
    saveToHistory(cells, title, newTextSections)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Notebook Analysis",
        text: "Check out this data analysis",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(cells, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "notebook-export.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleRunAll = () => {
    console.log("Running all cells...")
  }

  const handleRun = () => {
    console.log("Running current cell...")
  }

  const handleSidebarToggle = () => {
    const newCollapsedState = !isSidebarCollapsed
    setIsSidebarCollapsed(newCollapsedState)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsedState))
  }

  const handleSidebarMouseEnter = () => {
    if (isSidebarCollapsed) {
      setIsSidebarHovered(true)
      setIsSidebarOpen(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    if (isSidebarCollapsed) {
      setIsSidebarHovered(false)
      setIsSidebarOpen(false)
    }
  }

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = Math.max(200, Math.min(600, e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleResizeEnd = () => {
      if (!isResizing) return
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      localStorage.setItem("sidebar-width", sidebarWidth.toString())
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)
      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [isResizing, sidebarWidth])

  const effectiveSidebarOpen = !isSidebarCollapsed || isSidebarHovered
  const effectiveSidebarWidth = effectiveSidebarOpen ? sidebarWidth : 48

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      <Sidebar
        isOpen={effectiveSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        width={sidebarWidth}
        onClose={() => {
          setIsSidebarOpen(false)
          setIsSidebarHovered(false)
        }}
        onToggle={handleSidebarToggle}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onResizeStart={handleResizeStart}
        isResizing={isResizing}
      />

      <div className="flex-1 flex flex-col transition-all duration-300">
        <header
          className={`fixed top-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5 transition-all duration-300`}
          style={{ left: `${effectiveSidebarWidth}px` }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSidebarToggle}
                className="text-white/60 hover:text-white hover:bg-white/5"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalUndo}
                disabled={historyIndex <= 0}
                className="text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Global Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalRedo}
                disabled={historyIndex >= history.length - 1}
                className="text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Global Redo (Ctrl+Shift+Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-white/10 mx-2" />
              <h1 className="text-lg font-semibold text-white/90">Axilary Notebook</h1>
              {isPublishMode && (
                <span className="px-2 py-1 text-xs bg-emerald-600/20 text-emerald-400 rounded-sm border border-emerald-500/20">
                  Published
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isPublishMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRun}
                    className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunAll}
                    className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Run All
                  </Button>
                </>
              )}
              {isPublishMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPublishMode(!isPublishMode)}
                className={cn(
                  "border-white/10 hover:bg-white/5 hover:text-white transition-colors",
                  isPublishMode ? "bg-white/10 text-white border-white/20" : "bg-transparent text-white/80",
                )}
              >
                {isPublishMode ? (
                  <>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        <main
          className={`pt-16 flex-1 transition-all duration-300`}
          style={{ marginLeft: `${effectiveSidebarWidth}px` }}
        >
          <div className={cn("transition-all duration-300", isPublishMode ? "py-12 px-6" : "p-10")}>
            {isPublishMode ? (
              <NotebookPublisher cells={cells} title={title} textSections={textSections} />
            ) : (
              <NotebookEditor
                initialCells={cells}
                initialTitle={title}
                initialTextSections={textSections}
                onCellsChange={handleCellsChange}
                onTitleChange={handleTitleChange}
                onTextSectionsChange={handleTextSectionsChange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
