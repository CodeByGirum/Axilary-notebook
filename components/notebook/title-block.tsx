"use client"

import { RichTextEditor } from "../richtext/RichTextEditor"

interface TitleBlockProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function TitleBlock({ value, onChange, placeholder = "Untitled", readOnly = false }: TitleBlockProps) {
  return (
    <div className="mb-8">
      <div className="font-bold text-white" style={{ fontSize: "48px" }}>
        <RichTextEditor
          content={value}
          onChange={onChange}
          placeholder={placeholder}
          className="font-bold text-white min-h-[3rem]"
          style={{ fontSize: "48px" }}
          readOnly={readOnly}
          showToolbar={!readOnly}
          isTitle={true}
        />
      </div>
    </div>
  )
}
