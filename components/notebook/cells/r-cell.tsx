"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface RCellProps {
  content: string
  output?: string
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function RCell({ content, output, onChange, isRunning, isLocked = false }: RCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div>
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none resize-none text-white/90 text-base leading-relaxed font-mono"
              rows={Math.max(3, content.split("\n").length)}
              autoFocus
              readOnly={isLocked}
            />
          ) : (
            <pre
              onClick={() => !isLocked && setIsEditing(true)}
              className={cn(
                "cursor-text font-mono text-base leading-relaxed text-white/90",
                isRunning && "opacity-50 animate-pulse",
                isLocked && "cursor-default",
              )}
            >
              <code>{content || "# Enter R code..."}</code>
            </pre>
          )}
        </div>

        {(output || isRunning) && (
          <div className="border-t border-white/10 pt-3">
            <pre className={cn("font-mono text-sm leading-relaxed text-white/80", isRunning && "animate-pulse")}>
              {isRunning ? "Running R..." : output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
