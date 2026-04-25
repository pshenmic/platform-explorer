import { useState } from 'react'

const SIGNER_METHODS = {
  EXTENSION: 'extension',
  PRIVATE_KEY: 'privateKey'
}

export const SignerMethod = SIGNER_METHODS

export const useSigner = () => {
  const [method, setMethod] = useState(SIGNER_METHODS.EXTENSION)
  const [signer, setSigner] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const connectExtension = async () => {
    if (!window.dashPlatformExtension) {
      setError('Dash Platform Extension is not installed')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const wallet = await window.dashPlatformExtension.signer.connect()
      const current = wallet.identities?.find(
        ({ identifier }) => identifier === wallet.currentIdentity
      )
      if (!current) {
        throw new Error('Wallet connection returned no current identity')
      }

      setSigner({
        method: SIGNER_METHODS.EXTENSION,
        identityId: wallet.currentIdentity,
        signAndBroadcast: (stateTransition) =>
          window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)
      })
    } catch (e) {
      setError(e?.message ?? e?.toString() ?? 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const connect = () => {
    if (method === SIGNER_METHODS.EXTENSION) return connectExtension()
    setError('Selected method is not yet supported')
  }

  return {
    method,
    setMethod,
    signer,
    isConnected: signer != null,
    isConnecting,
    error,
    connect
  }
}
