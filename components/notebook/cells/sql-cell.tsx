"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SqlCellProps {
  content: string
  output?: string
  metadata?: any
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function SqlCell({ content, output, metadata, onChange, isRunning, isLocked = false }: SqlCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Mock result data for demo
  const mockResults = [
    { name: "Alice", age: "28", revenue: "$92k" },
    { name: "Bob", age: "34", revenue: "$85k" },
    { name: "Charlie", age: "29", revenue: "$78k" },
  ]

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
              <code>{content || "SELECT * FROM table_name;"}</code>
            </pre>
          )}
        </div>

        {(mockResults.length > 0 || isRunning) && (
          <div className="border-t border-white/10 pt-3">
            {isRunning ? (
              <div className="animate-pulse text-white/80 text-sm">Executing query...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-white/70">
                    <tr>
                      <th className="border border-white/10 px-3 py-2 font-medium">Name</th>
                      <th className="border border-white/10 px-3 py-2 font-medium">Age</th>
                      <th className="border border-white/10 px-3 py-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {mockResults.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-white/10 px-3 py-2">{row.name}</td>
                        <td className="border border-white/10 px-3 py-2">{row.age}</td>
                        <td className="border border-white/10 px-3 py-2 text-right">{row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
