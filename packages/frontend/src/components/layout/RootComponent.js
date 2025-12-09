'use client'

import { NetworkProvider, BreadcrumbsProvider, ThemeProvider, ModalProvider, WalletProvider } from 'src/contexts'
import Navbar from './navbar/Navbar'
import Footer from './footer'
import Background from './Background'

import '../../styles/theme.scss'

export default function RootComponent ({ children }) {
  return (
    <NetworkProvider>
      <WalletProvider>
        <ThemeProvider>
          <ModalProvider>
            <Background snow={false}/>
            <BreadcrumbsProvider>
              <Navbar/>
              {children}
            </BreadcrumbsProvider>
            <Footer/>
          </ModalProvider>
        </ThemeProvider>
      </WalletProvider>
    </NetworkProvider>
  )
}
