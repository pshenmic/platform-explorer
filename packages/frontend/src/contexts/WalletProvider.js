'use client'

import { createContext, useContext, useState, useRef } from 'react'

const WalletContext = createContext({})

export const WalletProvider = ({ children }) => {
  const connected = useRef(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)

  const connectWallet = async (cb) => {
    if (!window.dashPlatformExtension) {
      return setError('Dash Platform Extension is not installed')
    }

    const { dashPlatformExtension } = window

    try {
      const wallet = await dashPlatformExtension.signer.connect()
      const current = wallet.identities.find(
        ({ identifier }) => identifier === wallet.currentIdentity
      )
      connected.current = true
      setWalletInfo({ identities: wallet.identities, current })
      setError(null)
      cb(wallet)
    } catch (e) {
      setError(e)
      console.log(e)
    }
  }

  return (
    <WalletContext.Provider value={{ connectWallet, connected, walletInfo, error }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
