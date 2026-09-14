'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useOutsideClick(props: {
  ref: RefObject<HTMLElement | null>
  handler: (event: Event) => void
  enabled?: boolean
}): void {
  const { ref, handler, enabled = true } = props

  useEffect(() => {
    if (!enabled) return undefined

    const listener = (event: Event) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, enabled])
}
