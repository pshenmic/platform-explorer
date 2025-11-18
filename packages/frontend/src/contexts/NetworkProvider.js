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
    const sdk = window.dashPlatformSDK
    if (!sdk) {
      console.log('Dash Platform SDK is not initialized')
      return
    }

    sdk.setNetwork(network)
  }, [network])

  return (
    <NetworkContext.Provider value={NETWORK_OPTIONS[network]}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useActiveNetwork = () => useContext(NetworkContext)
