"use client"

import { useState, useCallback, useRef } from "react"

interface EditorState {
  isFocused: boolean
  showToolbar: boolean
  hasSelection: boolean
  isTyping: boolean
}

export function useEditorState(isTitle = false) {
  const [state, setState] = useState<EditorState>({
    isFocused: false,
    showToolbar: false,
    hasSelection: false,
    isTyping: false,
  })

  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const setFocused = useCallback(
    (focused: boolean) => {
      setState((prev) => ({
        ...prev,
        isFocused: focused,
        showToolbar: focused && !isTitle,
      }))
    },
    [isTitle],
  )

  const setSelection = useCallback((hasSelection: boolean) => {
    setState((prev) => ({ ...prev, hasSelection }))
  }, [])

  const setTyping = useCallback((typing: boolean, delay = 500) => {
    setState((prev) => ({ ...prev, isTyping: typing }))

    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isTyping: false }))
      }, delay)
    }
  }, [])

  const forceShowToolbar = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showToolbar: show }))
  }, [])

  return {
    ...state,
    setFocused,
    setSelection,
    setTyping,
    forceShowToolbar,
  }
}
