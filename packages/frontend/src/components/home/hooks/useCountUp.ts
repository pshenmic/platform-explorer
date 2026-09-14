'use client'

import { useState, useEffect, useRef } from 'react'

export function useCountUp(
  target: number | string | null | undefined,
  duration = 800,
  startAtTarget = false
): number | string | null | undefined {
  const [value, setValue] = useState<number | string | null | undefined>(
    typeof target === 'number' ? (startAtTarget ? target : 0) : target
  )
  const fromRef = useRef(typeof target === 'number' && startAtTarget ? target : 0)
  const firstRef = useRef(true)
  const startAtTargetRef = useRef(startAtTarget)
  startAtTargetRef.current = startAtTarget

  useEffect(() => {
    if (typeof target !== 'number' || Number.isNaN(target)) {
      setValue(target)
      return
    }

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (reduce || (startAtTargetRef.current && firstRef.current)) {
      firstRef.current = false
      setValue(target)
      fromRef.current = target
      return
    }
    firstRef.current = false

    const from = fromRef.current
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - p) ** 3
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
