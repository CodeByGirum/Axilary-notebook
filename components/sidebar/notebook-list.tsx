"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, MoreHorizontal, Eye, EyeOff, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotebookList } from "@/hooks/use-notebook-list"

interface NotebookListProps {
  currentNotebookId?: string
  onNotebookSelect: (notebookId: string) => void
  onNewNotebook: () => void
}

export function NotebookList({ currentNotebookId, onNotebookSelect, onNewNotebook }: NotebookListProps) {
  const { visibleNotebooks, hiddenNotebooks, isLoading, createNotebook, toggleNotebookVisibility, deleteNotebook } =
    useNotebookList()

  const [showHidden, setShowHidden] = useState(false)

  const handleCreateNotebook = async () => {
    const newNotebook = await createNotebook()
    if (newNotebook) {
      onNewNotebook()
      // Optionally switch to the new notebook
      onNotebookSelect(newNotebook.id)
    }
  }

  const handleNotebookAction = (action: string, notebookId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    switch (action) {
      case "hide":
        toggleNotebookVisibility(notebookId)
        break
      case "show":
        toggleNotebookVisibility(notebookId)
        break
      case "delete":
        if (confirm("Are you sure you want to delete this notebook?")) {
          deleteNotebook(notebookId)
        }
        break
    }
  }

  return (
    <div className="space-y-2">
      {/* Header with New Notebook button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookOpen className="h-4 w-4 text-white/60 flex-shrink-0" />
          <span className="text-sm font-medium text-white/80 truncate">Notebooks</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateNotebook}
          className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/5 flex-shrink-0"
          title="Create New Notebook"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && <div className="ml-6 text-xs text-white/40 py-1">Loading notebooks...</div>}

      {/* Visible notebooks */}
      <div className="ml-6 space-y-1">
        {visibleNotebooks.map((notebook) => (
          <div
            key={notebook.id}
            className={`group flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors ${
              currentNotebookId === notebook.id ? "bg-white/10 text-white" : "text-white/60"
            }`}
            onClick={() => onNotebookSelect(notebook.id)}
          >
            <span className="truncate flex-1 mr-2">{notebook.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border-white/10" align="end">
                <DropdownMenuItem
                  onClick={(e) => handleNotebookAction("hide", notebook.id, e)}
                  className="text-white/80 focus:bg-white/10 focus:text-white"
                >
                  <EyeOff className="h-3 w-3 mr-2" />
                  Hide from sidebar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={(e) => handleNotebookAction("delete", notebook.id, e)}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete notebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {visibleNotebooks.length === 0 && !isLoading && (
          <div className="text-xs text-white/40 py-1">No notebooks yet</div>
        )}
      </div>

      {/* Hidden notebooks section */}
      {hiddenNotebooks.length > 0 && (
        <div className="ml-6 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
            className="h-6 w-full justify-start p-1 text-white/40 hover:text-white/60 hover:bg-white/5"
          >
            {showHidden ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <span className="text-xs">Hidden ({hiddenNotebooks.length})</span>
          </Button>

          {showHidden && (
            <div className="ml-4 space-y-1">
              {hiddenNotebooks.map((notebook) => (
                <div
                  key={notebook.id}
                  className={`group flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors ${
                    currentNotebookId === notebook.id ? "bg-white/10 text-white" : "text-white/40"
                  }`}
                  onClick={() => onNotebookSelect(notebook.id)}
                >
                  <span className="truncate flex-1 mr-2">{notebook.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a1a] border-white/10" align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleNotebookAction("show", notebook.id, e)}
                        className="text-white/80 focus:bg-white/10 focus:text-white"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        Show in sidebar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={(e) => handleNotebookAction("delete", notebook.id, e)}
                        className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete notebook
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
