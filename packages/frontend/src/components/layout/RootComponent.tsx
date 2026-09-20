'use client'

import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import {
  NetworkProvider,
  BreadcrumbsProvider,
  ThemeProvider,
  ModalProvider,
  WalletProvider,
  QueryProvider,
  TooltipProvider
} from 'src/contexts'
import Background from './Background'
import NavbarPlaceholder from './navbar/NavbarPlaceholder'

const Navbar = dynamic(() => import('./navbar/Navbar'), {
  loading: NavbarPlaceholder
})
const Footer = dynamic(() => import('./footer'), { ssr: false })

interface RootComponentProps {
  children?: ReactNode
}

export default function RootComponent({ children }: RootComponentProps) {
  return (
    <NuqsAdapter>
      <NetworkProvider>
        <QueryProvider>
          <WalletProvider>
            <ThemeProvider>
              <TooltipProvider>
                <ModalProvider>
                  <Background />
                  <BreadcrumbsProvider>
                    <Navbar />
                    {children}
                  </BreadcrumbsProvider>
                  <Footer />
                </ModalProvider>
              </TooltipProvider>
            </ThemeProvider>
          </WalletProvider>
        </QueryProvider>
      </NetworkProvider>
    </NuqsAdapter>
  )
}
