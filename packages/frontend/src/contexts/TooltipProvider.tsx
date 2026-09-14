'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface TooltipActiveContextValue {
  activeId: string | null
  pinnedId: string | null
  activate: (id: string) => void
  deactivate: (id: string) => void
  pin: (id: string) => void
  unpin: (id: string) => void
}

const TooltipActiveContext = createContext<TooltipActiveContextValue | null>(null)

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)

  const activate = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const deactivate = useCallback((id: string) => {
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  const pin = useCallback((id: string) => {
    setPinnedId(id)
    setActiveId(id)
  }, [])

  const unpin = useCallback((id: string) => {
    setPinnedId(prev => (prev === id ? null : prev))
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  const value = useMemo(
    () => ({ activeId, pinnedId, activate, deactivate, pin, unpin }),
    [activeId, pinnedId, activate, deactivate, pin, unpin]
  )

  return <TooltipActiveContext.Provider value={value}>{children}</TooltipActiveContext.Provider>
}

export function useTooltipActive() {
  return useContext(TooltipActiveContext)
}
