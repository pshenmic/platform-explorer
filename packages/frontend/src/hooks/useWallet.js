import { useState, useRef } from 'react'

export const useWalletConnect = () => {
  const connected = useRef(false)
  const [error, setError] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)
  const [currentIdentity, setCurrentIdentity] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      return setError('Voting is available to Masternode Owners (via Dash Platform Extension)')
    }

    const { dashPlatformExtension } = window

    setIsConnecting(true)
    dashPlatformExtension.signer
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
      .catch((error) => {
        setError(error.toString() || 'Failed to connect wallet')
      })
      .finally(() => setIsConnecting(false))
  }

  return {
    connectWallet,
    connected,
    error,
    walletInfo,
    currentIdentity,
    isConnecting
  }
}
