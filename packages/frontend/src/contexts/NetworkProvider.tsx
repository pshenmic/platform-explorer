'use client'

import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NETWORK_OPTIONS, NETWORKS_ENUM } from 'src/constants/networks'

export interface NetworkOption {
  name: string
  subname: string
  disabled: boolean
  explorerBaseUrl: string | undefined
  l1explorerBaseUrl: string | undefined
  dataContractPE: string | undefined
}

// window.dashPlatformSDK is injected by the Dash Platform browser extension.
// Typed minimally — only the method we call here.
interface DashPlatformSdk {
  setNetwork: (network: string) => void
}

declare global {
  interface Window {
    dashPlatformSDK?: DashPlatformSdk
  }
}

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

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const tryApply = () => {
      if (cancelled) return
      const sdk = window.dashPlatformSDK
      if (!sdk) {
        timer = setTimeout(tryApply, 100)
        return
      }
      sdk.setNetwork(network)
    }

    tryApply()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [network])

  return (
    <NetworkContext.Provider value={NETWORK_OPTIONS[network]}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useActiveNetwork = (): NetworkOption => useContext(NetworkContext)
