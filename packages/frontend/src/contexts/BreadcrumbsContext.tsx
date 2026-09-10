'use client'

import { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'

export interface Breadcrumb {
  label: string
  path?: string
  avatar?: boolean
}

interface BreadcrumbsContextValue {
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>
}

const BreadcrumbsContext = createContext<BreadcrumbsContextValue>({
  breadcrumbs: [],
  setBreadcrumbs: () => undefined
})

export const useBreadcrumbs = (): BreadcrumbsContextValue => useContext(BreadcrumbsContext)

interface BreadcrumbsProviderProps {
  children: ReactNode
}

export const BreadcrumbsProvider = ({ children }: BreadcrumbsProviderProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const contextValue: BreadcrumbsContextValue = { breadcrumbs, setBreadcrumbs }

  return <BreadcrumbsContext.Provider value={contextValue}>{children}</BreadcrumbsContext.Provider>
}
