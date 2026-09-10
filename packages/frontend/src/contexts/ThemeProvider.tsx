'use client'

import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import theme from 'src/styles/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useEffect(() => {
    localStorage.setItem('chakra-ui-color-mode', theme.initialColorMode)
  }, [])

  return (
    <ChakraProvider theme={theme} colorModeManager={localStorageManager}>
      {children}
    </ChakraProvider>
  )
}
