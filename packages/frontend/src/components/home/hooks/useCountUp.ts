'use client'

import { useState, useEffect, useRef } from 'react'

export function useCountUp(
  target: number | string | null | undefined,
  duration = 800,
  startAtTarget = false,
  decimals = 0
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

    if (
      reduce ||
      duration <= 0 ||
      (startAtTargetRef.current && firstRef.current) ||
      (decimals > 0 && fromRef.current === target)
    ) {
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
      const next = from + (target - from) * eased
      fromRef.current = next
      setValue(p === 1 && decimals > 0 ? target : Number(next.toFixed(decimals)))
      if (p < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, decimals])

  return duration <= 0 ? target : value
}
