'use client'

import { createContext, useContext, useState, useRef } from 'react'

const WalletContext = createContext({})

export const WalletProvider = ({ children }) => {
  const connected = useRef(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)
  const [currentIdentity, setCurrentIdentity] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      return setError('Dash Platform Extension is not installed')
    }

    const { dashPlatformExtension } = window

    setIsConnecting(true)
    return dashPlatformExtension.signer
      .connect()
      .then((wallet) => {
        const current = wallet.identities?.find(
          ({ identifier }) => identifier === wallet.currentIdentity
        )
        if (!current) {
          setError('Wallet connection returned no current identity')
          return
        }
        connected.current = true
        setWalletInfo({ ...wallet, proTxHash: current.proTxHash })
        setError(null)
        setCurrentIdentity(wallet.currentIdentity)
      })
      .catch((e) => {
        setError(e?.toString() || 'Failed to connect wallet')
      })
      .finally(() => setIsConnecting(false))
  }

  return (
    <WalletContext.Provider value={{ connectWallet, connected, walletInfo, currentIdentity, error, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
