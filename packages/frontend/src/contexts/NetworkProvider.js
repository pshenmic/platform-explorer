'use client'

import { createContext, useContext, useEffect } from 'react'
import { NETWORK_OPTIONS, NETWORKS_ENUM } from 'src/constants/networks'

const NetworkContext = createContext({})

export const NetworkProvider = ({ children }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const network =
    NETWORK_OPTIONS[NETWORKS_ENUM.MAINNET].explorerBaseUrl === baseUrl
      ? NETWORKS_ENUM.MAINNET
      : NETWORKS_ENUM.TESTNET

  useEffect(() => {
    let cancelled = false
    let timer

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

export const useActiveNetwork = () => useContext(NetworkContext)
