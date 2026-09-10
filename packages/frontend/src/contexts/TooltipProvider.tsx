'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface TooltipActiveContextValue {
  activeId: string | null
  activate: (id: string) => void
  deactivate: (id: string) => void
}

const TooltipActiveContext = createContext<TooltipActiveContextValue | null>(null)

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const activate = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const deactivate = useCallback((id: string) => {
    setActiveId(prev => (prev === id ? null : prev))
  }, [])

  const value = useMemo(
    () => ({ activeId, activate, deactivate }),
    [activeId, activate, deactivate]
  )

  return <TooltipActiveContext.Provider value={value}>{children}</TooltipActiveContext.Provider>
}

export function useTooltipActive() {
  return useContext(TooltipActiveContext)
}
