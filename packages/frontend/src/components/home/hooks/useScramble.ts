'use client'

import { useState, useEffect, useRef } from 'react'

const HEX = '0123456789ABCDEF'

// Text counterpart of useCountUp for hashes: on change, characters shuffle through random
// hex digits and lock into the new value left to right. Snaps under reduced motion.
export function useScramble(
  text: string | null | undefined,
  duration = 500
): string | null | undefined {
  const [value, setValue] = useState(text)
  const firstRef = useRef(true)

  useEffect(() => {
    if (typeof text !== 'string' || !text) {
      setValue(text)
      return
    }

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (reduce || firstRef.current) {
      firstRef.current = false
      setValue(text)
      return
    }

    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const locked = Math.floor(text.length * p)
      const frame = text
        .split('')
        .map((ch, i) => {
          if (i < locked || !/[0-9a-zA-Z]/.test(ch)) return ch
          return HEX[Math.floor(Math.random() * HEX.length)]
        })
        .join('')
      setValue(p < 1 ? frame : text)
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, duration])

  return value
}
