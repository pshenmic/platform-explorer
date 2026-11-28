'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
