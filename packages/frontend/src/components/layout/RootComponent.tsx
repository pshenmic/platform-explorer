'use client'

import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { NetworkProvider, BreadcrumbsProvider, ThemeProvider, ModalProvider, WalletProvider, QueryProvider } from 'src/contexts'
import Navbar from './navbar/Navbar'
import Footer from './footer'
import Background from './Background'

import '../../styles/tokens/index.css'
import '../../styles/theme.scss'

interface RootComponentProps {
  children?: ReactNode
}

export default function RootComponent ({ children }: RootComponentProps) {
  return (
    <NuqsAdapter>
      <NetworkProvider>
        <QueryProvider>
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
        </QueryProvider>
      </NetworkProvider>
    </NuqsAdapter>
  )
}
