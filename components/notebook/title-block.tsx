"use client"

import { NotebookTitle } from "./notebook-title"

interface TitleBlockProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function TitleBlock({ value, onChange, placeholder = "Untitled", readOnly = false }: TitleBlockProps) {
  return <NotebookTitle value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} />
}
