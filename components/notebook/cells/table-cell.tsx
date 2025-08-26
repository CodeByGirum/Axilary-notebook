"use client"

interface TableCellProps {
  content: string
  metadata?: any
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function TableCell({ content, metadata, onChange, isRunning, isLocked = false }: TableCellProps) {
  // Mock table data
  const mockData = [
    { key: "Alice", value: "85" },
    { key: "Bob", value: "92" },
    { key: "Charlie", value: "78" },
  ]

  return (
    <div className="w-full">
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/70">
              <tr>
                <th className="border border-white/10 px-3 py-2 font-medium">Key</th>
                <th className="border border-white/10 px-3 py-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {mockData.map((row, i) => (
                <tr key={i}>
                  <td className="border border-white/10 px-3 py-2">{row.key}</td>
                  <td className="border border-white/10 px-3 py-2 text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
