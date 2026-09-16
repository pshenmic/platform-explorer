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
import Navbar from './navbar/Navbar'
import Background from './Background'

const Footer = dynamic(() => import('./footer'), { ssr: false })

import '../../styles/tokens/index.css'
import '../../styles/theme.css'

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
                  <Background snow={false} />
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
