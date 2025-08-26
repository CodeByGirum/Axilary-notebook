"use client"

import { useState } from "react"

interface ParamsCellProps {
  content: string
  metadata?: any
  onChange: (content: string) => void
  isRunning?: boolean
  isLocked?: boolean
}

export function ParamsCell({ content, metadata, onChange, isRunning, isLocked = false }: ParamsCellProps) {
  const [learningRate, setLearningRate] = useState(0.01)
  const [epochs, setEpochs] = useState(10)
  const [batchSize, setBatchSize] = useState(32)

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-white/90 text-base">Learning Rate</span>
            <input
              type="number"
              step="0.001"
              value={learningRate}
              onChange={(e) => setLearningRate(Number.parseFloat(e.target.value))}
              disabled={isLocked}
              className="bg-neutral-800/50 border border-white/10 rounded-md px-3 py-1 text-sm w-24 text-white/90 disabled:opacity-50"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-white/90 text-base">Epochs</span>
            <input
              type="number"
              value={epochs}
              onChange={(e) => setEpochs(Number.parseInt(e.target.value))}
              disabled={isLocked}
              className="bg-neutral-800/50 border border-white/10 rounded-md px-3 py-1 text-sm w-24 text-white/90 disabled:opacity-50"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-white/90 text-base">Batch Size</span>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Number.parseInt(e.target.value))}
              disabled={isLocked}
              className="bg-neutral-800/50 border border-white/10 rounded-md px-3 py-1 text-sm w-24 text-white/90 disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
