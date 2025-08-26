import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import type { AIGenerationRequest } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const body: AIGenerationRequest = await request.json()

    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 })
    }

    const result = await aiService.generateCells(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
