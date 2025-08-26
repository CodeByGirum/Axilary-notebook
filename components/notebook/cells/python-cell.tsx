"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface PythonCellProps {
  content: string
  output?: string
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function PythonCell({ content, output, onChange, isRunning, isLocked = false }: PythonCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* Code Section */}
        <div className="w-full">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="w-full bg-transparent border-none outline-none resize-none text-white/90 text-sm sm:text-base leading-relaxed font-mono min-h-[3rem] p-0"
              rows={Math.max(3, content.split("\n").length)}
              autoFocus
              readOnly={isLocked}
            />
          ) : (
            <pre
              onClick={() => !isLocked && setIsEditing(true)}
              className={cn(
                "cursor-text font-mono text-sm sm:text-base leading-relaxed text-white/90 whitespace-pre-wrap break-words",
                isRunning && "opacity-50 animate-pulse",
                isLocked && "cursor-default",
              )}
            >
              <code>{content || "# Enter Python code..."}</code>
            </pre>
          )}
        </div>

        {(output || isRunning) && (
          <div className="border-t border-white/10 pt-3">
            <pre
              className={cn(
                "font-mono text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-wrap break-words overflow-x-auto",
                isRunning && "animate-pulse",
              )}
            >
              {isRunning ? "Running..." : output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
