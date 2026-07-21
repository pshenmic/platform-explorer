'use client'

import { useState, useEffect, useRef } from 'react'

// Eases a number from its previous value to target; snaps under reduced-motion / non-numbers.
export function useCountUp (target, duration = 800) {
  const [value, setValue] = useState(typeof target === 'number' ? 0 : target)
  const fromRef = useRef(0)

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) {
      setValue(target)
      return
    }

    const reduce = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (reduce) {
      setValue(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let raf

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
