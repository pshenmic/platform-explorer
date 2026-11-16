'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { NETWORK_OPTIONS, NETWORKS_ENUM } from 'src/constants/networks'
import type { NetworkOption } from 'src/constants/networks'

// Re-exported for backward compatibility — `NetworkOption` now lives in constants/networks.
export type { NetworkOption }

const NetworkContext = createContext<NetworkOption>(NETWORK_OPTIONS[NETWORKS_ENUM.TESTNET])

interface NetworkProviderProps {
  children: ReactNode
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const network =
    NETWORK_OPTIONS[NETWORKS_ENUM.MAINNET].explorerBaseUrl === baseUrl
      ? NETWORKS_ENUM.MAINNET
      : NETWORKS_ENUM.TESTNET

  return (
    <NetworkContext.Provider value={NETWORK_OPTIONS[network]}>{children}</NetworkContext.Provider>
  )
}

export const useActiveNetwork = (): NetworkOption => useContext(NetworkContext)
