'use client'

import { ModalProvider, NetworkProvider, BreadcrumbsProvider, ThemeProvider } from 'src/contexts'
import Navbar from './navbar/Navbar'
import Footer from './footer'
import Background from './Background'

import '../../styles/theme.scss'

export default function RootComponent ({ children }) {
  return (
    <NetworkProvider>
      <ThemeProvider>
        <Background snow={false}/>
        <BreadcrumbsProvider>
          <ModalProvider>
            <Navbar/>
            {children}
          </ModalProvider>
        </BreadcrumbsProvider>
        <Footer/>
      </ThemeProvider>
    </NetworkProvider>
  )
}
