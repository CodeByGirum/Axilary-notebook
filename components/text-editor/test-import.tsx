"use client"

// Test all possible import patterns
import TextEditor from "./text-editor"
import { TextEditor as NamedTextEditor } from "./text-editor"
import DefaultFromIndex from "./index"
import { TextEditor as FromIndex } from "./index"

// Test the component exists and is callable
export function TestTextEditor() {
  console.log("[v0] TextEditor import test:", {
    TextEditor: typeof TextEditor,
    NamedTextEditor: typeof NamedTextEditor,
    DefaultFromIndex: typeof DefaultFromIndex,
    FromIndex: typeof FromIndex,
  })

  return (
    <div>
      <TextEditor initialContent="Test 1" />
      <NamedTextEditor initialContent="Test 2" />
      <DefaultFromIndex initialContent="Test 3" />
      <FromIndex initialContent="Test 4" />
    </div>
  )
}
