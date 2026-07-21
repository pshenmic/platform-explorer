'use client'

import { useState, useEffect, useRef } from 'react'

// Cycles through items, pausing on hover; stays static under prefers-reduced-motion.
export function useRotator (items, intervalMs = 4500) {
  const [index, setIndex] = useState(0)
  const pausedRef = useRef(false)
  const length = items?.length || 0

  useEffect(() => { setIndex(0) }, [length])

  useEffect(() => {
    if (length < 2) return
    const reduce = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) return

    const id = setInterval(() => {
      if (!pausedRef.current) setIndex(i => (i + 1) % length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [length, intervalMs])

  const safeIndex = length ? index % length : 0
  return {
    item: length ? items[safeIndex] : null,
    index: safeIndex,
    length,
    setIndex,
    onMouseEnter: () => { pausedRef.current = true },
    onMouseLeave: () => { pausedRef.current = false }
  }
}
