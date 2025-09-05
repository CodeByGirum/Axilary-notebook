"use client"

import { useRef, useState, useCallback } from "react"

/**
 * Manages debounced typing indicator state
 */
export function useTypingIndicator(debounceMs = 500) {
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const setTypingState = useCallback(
    (typing: boolean, customDebounce?: number) => {
      setIsTyping(typing)

      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, customDebounce || debounceMs)
      }
    },
    [debounceMs],
  )

  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  return {
    isTyping,
    setTypingState,
    clearTypingTimeout,
  }
}
