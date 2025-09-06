"use client"
import { Button } from "@/components/ui/button"
import { Eye, Share, Download, Menu, PlayCircle, ArrowLeft, ArrowRight } from "lucide-react"

interface PageHeaderProps {
  effectiveSidebarWidth: number
  viewMode: "edit" | "preview" | "publish"
  onSidebarToggle: () => void
  onRunAll: () => void
  onShare: () => void
  onExport: () => void
  onGoToPreview: () => void
  onGoToPublish: () => void
  onGoToEdit: () => void
  isSidebarCollapsed: boolean
}

export function PageHeader({
  effectiveSidebarWidth,
  viewMode,
  onSidebarToggle,
  onRunAll,
  onShare,
  onExport,
  onGoToPreview,
  onGoToPublish,
  onGoToEdit,
  isSidebarCollapsed,
}: PageHeaderProps) {
  return (
    <header
      className="fixed top-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5 transition-all duration-300"
      style={{ left: `${effectiveSidebarWidth}px` }}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="text-white/60 hover:text-white hover:bg-white/5"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <h1 className="text-lg font-semibold text-white/90">Axilary Notebook</h1>
          {viewMode === "preview" && (
            <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-sm border border-blue-500/20">
              Preview
            </span>
          )}
          {viewMode === "publish" && (
            <span className="px-2 py-1 text-xs bg-emerald-600/20 text-emerald-400 rounded-sm border border-emerald-500/20">
              Published
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== "edit" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToEdit}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to Edit
            </Button>
          )}

          {viewMode === "edit" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onRunAll}
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Run All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToPreview}
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </>
          )}

          {viewMode === "preview" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToPublish}
                className="bg-emerald-600/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Publish
              </Button>
            </>
          )}

          {viewMode === "publish" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
