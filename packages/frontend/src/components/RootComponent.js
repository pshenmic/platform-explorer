'use client'

import Navbar from '../components/navbar/Navbar'
import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { useEffect } from 'react'
import theme from '../styles/theme'
import '../styles/theme.scss'
import Footer from './footer'

export default function RootComponent ({ children }) {
  useEffect(() => {
    localStorage.setItem('chakra-ui-color-mode', theme.initialColorMode)
  }, [])

  return (
    <ChakraProvider theme={ theme } colorModeManager={localStorageManager}>
        <Navbar/>

        { children }
    </ChakraProvider>
  )
}
