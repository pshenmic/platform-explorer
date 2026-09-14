'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
