'use client'

import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { useEffect } from 'react'
import theme from 'src/styles/theme'

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    localStorage.setItem('chakra-ui-color-mode', theme.initialColorMode)
  }, [])

  return (
    <ChakraProvider
      theme={theme}
      colorModeManager={localStorageManager}
    >
      {children}
    </ChakraProvider>
  )
}
