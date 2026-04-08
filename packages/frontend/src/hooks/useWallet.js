import { useState, useRef } from 'react'

export const useWalletConnect = () => {
  const connected = useRef(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)
  const [currentIdentity, setCurrentIdentity] = useState(null)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      return setError('Dash Platform Extension is not installed')
    }

    const { dashPlatformExtension } = window

    dashPlatformExtension.signer
      .connect()
      .then((wallet) => {
        const current = wallet.identities.find(
          ({ identifier }) => identifier === wallet.currentIdentity
        )
        connected.current = true
        setWalletInfo({ ...wallet, proTxHash: current.proTxHash })
        setError(null)
        setCurrentIdentity(wallet.currentIdentity)
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
