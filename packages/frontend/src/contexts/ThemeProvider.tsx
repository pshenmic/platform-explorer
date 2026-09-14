'use client'

import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return children
}
