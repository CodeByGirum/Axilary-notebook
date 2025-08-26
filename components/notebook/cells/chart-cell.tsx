"use client"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"

interface ChartCellProps {
  content: string
  metadata?: any
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function ChartCell({ content, metadata, onChange, isRunning, isLocked = false }: ChartCellProps) {
  const chartTitle = metadata?.title || "Data Visualization"

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div
          className={cn(
            "h-48 w-full bg-neutral-900/50 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-center",
            isRunning && "animate-pulse",
          )}
        >
          {isRunning ? (
            <div className="text-white/80">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <div className="text-sm">Generating chart...</div>
            </div>
          ) : (
            <div className="text-white/60">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <div className="text-base font-medium">{chartTitle}</div>
              <div className="text-sm mt-1">Interactive visualization would render here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
