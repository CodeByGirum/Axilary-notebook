"use client"

import { useState, useCallback } from "react"
import type { AIGenerationRequest, AIGenerationResponse } from "@/lib/ai-service"

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCells = useCallback(async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      const result: AIGenerationResponse = await response.json()

      if (!result.success) {
        setError(result.error || "Generation failed")
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error"
      setError(errorMessage)
      return {
        success: false,
        cells: [],
        error: errorMessage,
      }
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    generateCells,
    isGenerating,
    error,
    clearError: () => setError(null),
  }
}
