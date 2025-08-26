"use client"

import type { NotebookCellData } from "@/types/notebook"

interface PublishedCellProps {
  cell: NotebookCellData
  index?: number
}

export function PublishedCell({ cell, index }: PublishedCellProps) {
  switch (cell.type) {
    case "markdown":
      return (
        <div
          className="prose prose-invert prose-lg max-w-none leading-relaxed text-white/85"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(cell.content),
          }}
        />
      )

    case "python":
    case "r":
      return (
        <div className="space-y-4">
          <pre className="bg-neutral-900/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm font-mono text-white/90 leading-relaxed">{cell.content}</code>
          </pre>

          {cell.output && (
            <div className="border-t border-white/10 pt-4">
              <pre className="text-sm font-mono text-white/80 leading-relaxed">{cell.output}</pre>
            </div>
          )}
        </div>
      )

    case "sql":
      return (
        <div className="space-y-4">
          <pre className="bg-neutral-900/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm font-mono text-white/90 leading-relaxed">{cell.content}</code>
          </pre>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="px-3 py-2 text-left font-medium border-b border-white/10">Product</th>
                  <th className="px-3 py-2 text-right font-medium border-b border-white/10">Revenue</th>
                  <th className="px-3 py-2 text-right font-medium border-b border-white/10">Transactions</th>
                  <th className="px-3 py-2 text-right font-medium border-b border-white/10">Avg Value</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr>
                  <td className="px-3 py-2 border-b border-white/5">Premium Widget Pro</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">$120,000</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">25</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">$4,800</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border-b border-white/5">Analytics Suite</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">$98,000</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">20</td>
                  <td className="px-3 py-2 text-right border-b border-white/5">$4,900</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Enterprise Dashboard</td>
                  <td className="px-3 py-2 text-right">$76,000</td>
                  <td className="px-3 py-2 text-right">16</td>
                  <td className="px-3 py-2 text-right">$4,750</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )

    case "chart":
      return (
        <div className="space-y-4">
          <div className="h-80 w-full bg-neutral-900/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-white/60 mb-2">📊</div>
              <div className="text-white/80 font-medium">{cell.metadata?.title || "Revenue Distribution Chart"}</div>
              <div className="text-white/50 text-sm mt-1">Interactive visualization would render here</div>
            </div>
          </div>
        </div>
      )

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/70">
              <tr>
                <th className="px-3 py-2 text-left font-medium border-b border-white/10">Metric</th>
                <th className="px-3 py-2 text-right font-medium border-b border-white/10">Value</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              <tr>
                <td className="px-3 py-2 border-b border-white/5">Total Revenue</td>
                <td className="px-3 py-2 text-right border-b border-white/5">$413,000</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-b border-white/5">Average Transaction</td>
                <td className="px-3 py-2 text-right border-b border-white/5">$4,589</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Top Product Share</td>
                <td className="px-3 py-2 text-right">29.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    case "params":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Learning Rate:</span>
              <span className="text-white/90">0.01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Epochs:</span>
              <span className="text-white/90">10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Batch Size:</span>
              <span className="text-white/90">32</span>
            </div>
          </div>
        </div>
      )

    case "prompt":
      return (
        <div className="space-y-3">
          <div className="text-white/85 text-base leading-relaxed">
            {cell.content || "AI prompt content would appear here"}
          </div>
        </div>
      )

    case "gpu":
      return (
        <pre className="bg-neutral-900/50 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm font-mono text-white/80 leading-relaxed">{cell.output || cell.content}</code>
        </pre>
      )

    default:
      return null
  }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white/95 mb-6 mt-8 first:mt-0">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-white/90 mb-4 mt-8">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-white/85 mb-3 mt-6">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white/95">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/90">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="text-white/85 mb-1">$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6 mb-4 space-y-1">$1</ul>')
    .replace(/^\d+\. (.*$)/gm, '<li class="text-white/85 mb-1">$1</li>')
    .replace(/^([^<\n].+)$/gm, '<p class="text-white/85 mb-4 leading-relaxed">$1</p>')
}
