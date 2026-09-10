'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// holds incoming rows while hovered (WCAG 2.2.2: no motion under the cursor) and flags new rows
export function useLiveList<T>(items: T[] | null | undefined, keyOf: (item: T) => string | number) {
  const [shown, setShown] = useState<T[] | null | undefined>(items)
  const [newKeys, setNewKeys] = useState<Set<string | number>>(() => new Set())
  const hoverRef = useRef(false)
  const latestRef = useRef(items)
  const shownRef = useRef(items)
  const keyRef = useRef(keyOf)
  latestRef.current = items
  keyRef.current = keyOf

  const apply = useCallback((next: T[] | null | undefined) => {
    const prevKeys = new Set((shownRef.current || []).map(keyRef.current))
    shownRef.current = next
    // the very first payload isn't "new" — only rows appearing on later refreshes fade in
    setNewKeys(
      prevKeys.size
        ? new Set(
            (next || []).filter(item => !prevKeys.has(keyRef.current(item))).map(keyRef.current)
          )
        : new Set()
    )
    setShown(next)
  }, [])

  useEffect(() => {
    if (!hoverRef.current) apply(items)
  }, [items, apply])

  const hoverBind = {
    onMouseEnter: () => {
      hoverRef.current = true
    },
    onMouseLeave: () => {
      hoverRef.current = false
      apply(latestRef.current)
    }
  }

  return { shown, newKeys, hoverBind }
}
