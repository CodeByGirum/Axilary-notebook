"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { NotebookEditor } from "@/components/notebook/notebook-editor"
import { NotebookPublisher } from "@/components/notebook/notebook-publisher"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, Edit3, Share, Download, Menu, Play, PlayCircle, Undo, Redo } from "lucide-react"
import type { NotebookCellData } from "@/types/notebook"
import { undoRedoManager } from "@/lib/undo-redo-manager"

export default function NotebookPage() {
  const [isPublishMode, setIsPublishMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [cells, setCells] = useState<NotebookCellData[]>([])
  const [title, setTitle] = useState("Welcome to Axilary Notebook")
  const [textSections, setTextSections] = useState<any[]>([])

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const createStateChangeCommand = useCallback(
    (newCells: NotebookCellData[], newTitle: string, newTextSections: any[], description: string) => {
      const oldCells = [...cells]
      const oldTitle = title
      const oldTextSections = [...textSections]

      return {
        description,
        undo: () => {
          setCells(oldCells)
          setTitle(oldTitle)
          setTextSections(oldTextSections)
          localStorage.setItem("notebook-cells", JSON.stringify(oldCells))
          localStorage.setItem("notebook-title", oldTitle)
          localStorage.setItem("notebook-text-sections", JSON.stringify(oldTextSections))
        },
        redo: () => {
          setCells(newCells)
          setTitle(newTitle)
          setTextSections(newTextSections)
          localStorage.setItem("notebook-cells", JSON.stringify(newCells))
          localStorage.setItem("notebook-title", newTitle)
          localStorage.setItem("notebook-text-sections", JSON.stringify(newTextSections))
        },
      }
    },
    [cells, title, textSections],
  )

  useEffect(() => {
    const updateUndoRedoState = () => {
      setCanUndo(undoRedoManager.canUndo())
      setCanRedo(undoRedoManager.canRedo())
    }

    const handleStateChange = () => {
      updateUndoRedoState()
    }

    document.addEventListener("app:stateChanged", handleStateChange)
    updateUndoRedoState()

    return () => {
      document.removeEventListener("app:stateChanged", handleStateChange)
    }
  }, [])

  useEffect(() => {
    const savedCells = localStorage.getItem("notebook-cells")
    const savedTitle = localStorage.getItem("notebook-title")
    const savedTextSections = localStorage.getItem("notebook-text-sections")
    const savedSidebarWidth = localStorage.getItem("sidebar-width")

    if (savedCells) {
      setCells(JSON.parse(savedCells))
    }
    if (savedTitle) {
      setTitle(savedTitle)
    }
    if (savedTextSections) {
      setTextSections(JSON.parse(savedTextSections))
    }
    if (savedSidebarWidth) {
      setSidebarWidth(Number.parseInt(savedSidebarWidth))
    }
  }, [])

  const handleCellsChange = useCallback(
    (newCells: NotebookCellData[]) => {
      const command = createStateChangeCommand(newCells, title, textSections, "Cell changes")
      undoRedoManager.executeCommand(command)
    },
    [createStateChangeCommand, title, textSections],
  )

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      const command = createStateChangeCommand(cells, newTitle, textSections, "Title change")
      undoRedoManager.executeCommand(command)
    },
    [createStateChangeCommand, cells, textSections],
  )

  const handleTextSectionsChange = useCallback(
    (newTextSections: any[]) => {
      const command = createStateChangeCommand(cells, title, newTextSections, "Text section changes")
      undoRedoManager.executeCommand(command)
    },
    [createStateChangeCommand, cells, title],
  )

  const handleGlobalUndo = () => {
    undoRedoManager.undo()
  }

  const handleGlobalRedo = () => {
    undoRedoManager.redo()
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

  const handleSidebarMouseEnter = () => {
    setIsSidebarHovered(true)
    setIsSidebarOpen(true)
  }

  const handleSidebarMouseLeave = () => {
    setIsSidebarHovered(false)
    if (!isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = Math.max(200, Math.min(600, e.clientX))
      setSidebarWidth(newWidth)
    },
    [isResizing],
  )

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return

    setIsResizing(false)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    localStorage.setItem("sidebar-width", sidebarWidth.toString())
  }, [isResizing, sidebarWidth])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)

      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      <Sidebar
        isOpen={isSidebarOpen || isSidebarHovered}
        width={sidebarWidth}
        onClose={() => {
          setIsSidebarOpen(false)
          setIsSidebarHovered(false)
        }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onResizeStart={handleResizeStart}
        isResizing={isResizing}
      />

      <div className="flex-1 flex flex-col transition-all duration-300">
        <header
          className={`fixed top-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5 transition-all duration-300`}
          style={{ left: isSidebarOpen || isSidebarHovered ? `${sidebarWidth}px` : "48px" }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalUndo}
                disabled={!canUndo}
                className="text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Global Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGlobalRedo}
                disabled={!canRedo}
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
          style={{ marginLeft: isSidebarOpen || isSidebarHovered ? "0" : "48px" }}
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
