'use client'

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { NetworkProvider, BreadcrumbsProvider, ThemeProvider, ModalProvider, WalletProvider, QueryProvider } from 'src/contexts'
import Navbar from './navbar/Navbar'
import Footer from './footer'
import Background from './Background'

import '../../styles/theme.scss'

export default function RootComponent ({ children }) {
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
