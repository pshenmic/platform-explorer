import { useState } from 'react'

export const useWalletConnect = () => {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)
  const [currentIdentity, setCurrentIdentity] = useState(null)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      return setError('Dash Platform Extension is not installed')
    }

    const { dashPlatformExtension } = window

    dashPlatformExtension.signer.connect()
      .then((walletInfo) => {
        setConnected(true)
        setWalletInfo(walletInfo)
        setError(null)
        setCurrentIdentity(walletInfo.currentIdentity)
      })
      .catch((error) => {
        setError(error.toString() || 'Failed to connect wallet')
      })
  }

  return {
    connectWallet,
    connected,
    error,
    walletInfo,
    currentIdentity
  }
}
