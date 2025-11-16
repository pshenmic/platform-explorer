import { createContext, useContext, useEffect, useState } from 'react'
import { NETWORK_OPTIONS, NETWORKS_ENUM } from 'src/constants/networks'

const NetworkContext = createContext({})

export const NetworkProvider = ({ children }) => {
  const [network, setNetwork] = useState(NETWORKS_ENUM.TESTNET)
  const contextValue = {
    network,
    toTestnet: () => setNetwork(NETWORKS_ENUM.TESTNET),
    toMainnet: () => setNetwork(NETWORKS_ENUM.MAINNET),
    getNetworkOptions: () => NETWORK_OPTIONS[network]
  }

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const activeNetwork =
      NETWORK_OPTIONS[NETWORKS_ENUM.MAINNET].explorerBaseUrl === baseUrl
        ? NETWORKS_ENUM.MAINNET
        : NETWORKS_ENUM.TESTNET

    setNetwork(activeNetwork)
  }, [])

  useEffect(() => {
    const sdk = window.dashPlatformSDK
    if (!sdk) {
      console.log('Dash Platform SDK is not initialized')
      return
    }

    sdk.setNetwork(network)
  }, [network])

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
