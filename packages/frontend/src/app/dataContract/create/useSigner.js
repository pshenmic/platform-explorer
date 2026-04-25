import { useState } from 'react'
import { useActiveNetwork } from 'src/contexts'

const SIGNER_METHODS = {
  EXTENSION: 'extension',
  PRIVATE_KEY: 'privateKey'
}

export const SignerMethod = SIGNER_METHODS

export const useSigner = () => {
  const network = useActiveNetwork()
  const [method, setMethod] = useState(SIGNER_METHODS.EXTENSION)
  const [signer, setSigner] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const connectExtension = async () => {
    if (!window.dashPlatformExtension || !window.dashPlatformSDK) {
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
        sdk: window.dashPlatformSDK,
        signAndBroadcast: (stateTransition) =>
          window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)
      })
    } catch (e) {
      setError(e?.message ?? e?.toString() ?? 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWithPrivateKey = async ({ wif, identityId }) => {
    setIsConnecting(true)
    setError(null)

    try {
      const trimmedWif = wif?.trim()
      const trimmedIdentityId = identityId?.trim()
      if (!trimmedWif) throw new Error('Private key is required')

      const [{ DashPlatformSDK }, { PrivateKeyWASM, StateTransitionWASM, IdentityPublicKeyWASM }] = await Promise.all([
        import('dash-platform-sdk'),
        import('pshenmic-dpp')
      ])

      let privateKey
      try {
        privateKey = PrivateKeyWASM.fromWIF(trimmedWif)
      } catch {
        throw new Error('Invalid private key format (expected WIF)')
      }

      const sdk = new DashPlatformSDK({ network: network.name })
      const publicKeyHash = privateKey.getPublicKeyHash()

      let identity
      if (trimmedIdentityId) {
        identity = await sdk.identities.getIdentityByIdentifier(trimmedIdentityId)
      } else {
        const partial = await sdk.identities.getIdentityByPublicKeyHash(publicKeyHash)
        if (!partial) {
          throw new Error('No identity owns this private key on the current network')
        }
        // Re-fetch full identity by id to ensure we have full key data
        identity = await sdk.identities.getIdentityByIdentifier(partial.id.base58())
      }
      if (!identity) {
        throw new Error('Identity not found')
      }

      const matchingKey = identity
        .getPublicKeys()
        .find((pk) => pk.getPublicKeyHash() === publicKeyHash)
      if (!matchingKey) {
        throw new Error('Private key does not match this identity')
      }

      const identityIdStr = identity.id.base58()

      setSigner({
        method: SIGNER_METHODS.PRIVATE_KEY,
        identityId: identityIdStr,
        sdk,
        signAndBroadcast: async (stateTransition) => {
          // Re-fetch identity fresh — closure-captured WASM proxies can go stale
          const freshIdentity = await sdk.identities.getIdentityByIdentifier(identityIdStr)
          const freshKey = freshIdentity.getPublicKeys().find(
            (pk) => pk.getPublicKeyHash() === publicKeyHash
          )
          if (!freshKey) {
            throw new Error('Could not locate signing key on identity')
          }

          // pshenmic-dpp 1.1.2-dev.8 drops securityLevel when state_transition::sign()
          // does `&public_key.clone().into()` on a key returned by getPublicKeys() —
          // sign() then validates against MASTER (default) and rejects HIGH/CRITICAL
          // requirements. Reconstructing the key via the public constructor preserves
          // all fields through the conversion.
          const rebuiltKey = new IdentityPublicKeyWASM(
            freshKey.keyId,
            freshKey.purpose,
            freshKey.securityLevel,
            freshKey.keyType,
            freshKey.readOnly,
            freshKey.data,
            freshKey.disabledAt,
            freshKey.getContractBounds?.() ?? null
          )

          // Reconstruct state transition from base64 to avoid stale WASM proxy
          const fresh = StateTransitionWASM.fromBase64(stateTransition.base64())
          fresh.signaturePublicKeyId = rebuiltKey.keyId
          fresh.sign(privateKey, rebuiltKey)

          await sdk.stateTransitions.broadcast(fresh)
        }
      })
    } catch (e) {
      setError(e?.message ?? 'Failed to connect with private key')
    } finally {
      setIsConnecting(false)
    }
  }

  const connect = (params) => {
    if (method === SIGNER_METHODS.EXTENSION) return connectExtension()
    if (method === SIGNER_METHODS.PRIVATE_KEY) return connectWithPrivateKey(params ?? {})
    setError('Unknown signer method')
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
