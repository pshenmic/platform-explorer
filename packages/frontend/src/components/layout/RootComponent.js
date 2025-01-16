'use client'

import { ChakraProvider, localStorageManager } from '@chakra-ui/react'
import { BreadcrumbsProvider } from '../../contexts/BreadcrumbsContext'
import { useEffect } from 'react'
import theme from '../../styles/theme'
import Navbar from './navbar/Navbar'
import Footer from './footer'
import Background from './Background'
import '../../styles/theme.scss'

export default function RootComponent ({ children }) {
  useEffect(() => {
    localStorage.setItem('chakra-ui-color-mode', theme.initialColorMode)
  }, [])

  return (
    <ChakraProvider theme={theme} colorModeManager={localStorageManager}>
      <Background snow={false}/>
      <BreadcrumbsProvider>
        <Navbar/>
        {children}
      </BreadcrumbsProvider>
      <Footer/>
    </ChakraProvider>
  )
}
