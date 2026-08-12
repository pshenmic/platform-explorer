'use client'

import { useState, useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'

// Cycles through items, pausing on hover; stays static under prefers-reduced-motion.
export function useRotator<T> (items: T[] | null | undefined, intervalMs = 4500): {
  item: T | null
  index: number
  length: number
  setIndex: Dispatch<SetStateAction<number>>
  onMouseEnter: () => void
  onMouseLeave: () => void
} {
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
    item: length && items ? items[safeIndex] : null,
    index: safeIndex,
    length,
    setIndex,
    onMouseEnter: () => { pausedRef.current = true },
    onMouseLeave: () => { pausedRef.current = false }
  }
}
