import { useState } from 'react'
import type { DashPlatformSDK, StateTransitionWASM } from 'dash-platform-sdk/types'
import { useActiveNetwork } from 'src/contexts'

type KeyTypeArg = Parameters<StateTransitionWASM['signByPrivateKey']>[2]

const SIGNER_METHODS = {
  EXTENSION: 'extension',
  PRIVATE_KEY: 'privateKey'
}

export const SignerMethod = SIGNER_METHODS

export interface Signer {
  method: string
  identityId: string
  sdk: DashPlatformSDK
  sign: (stateTransition: StateTransitionWASM) => Promise<StateTransitionWASM> | StateTransitionWASM
  signAndBroadcast: (stateTransition: StateTransitionWASM) => Promise<unknown>
}

interface ConnectParams {
  wif?: string
  identityId?: string
}

export const useSigner = () => {
  const network = useActiveNetwork()
  const [method, setMethodState] = useState(SIGNER_METHODS.EXTENSION)
  const [signers, setSigners] = useState<Record<string, Signer | null>>({
    [SIGNER_METHODS.EXTENSION]: null,
    [SIGNER_METHODS.PRIVATE_KEY]: null
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signer = signers[method]

  const setMethod = (newMethod: string) => {
    setMethodState(newMethod)
    setError(null)
  }

  const cacheSigner = (signerObj: Signer): Signer => {
    setSigners((prev) => ({ ...prev, [signerObj.method]: signerObj }))
    return signerObj
  }

  const connectExtension = async () => {
    if (!window.dashPlatformExtension || !window.dashPlatformSDK) {
      setError('Dash Platform Extension is not installed')
      return null
    }

    const extension = window.dashPlatformExtension

    setIsConnecting(true)
    setError(null)

    try {
      const wallet = await extension.signer.connect()
      const current = wallet.identities?.find(
        ({ identifier }) => identifier === wallet.currentIdentity
      )
      if (!current) {
        throw new Error('Wallet connection returned no current identity')
      }

      // Use OUR bundled SDK + WASM (not the extension-injected `window.dashPlatformSDK`).
      // WASM-tagged objects (TokenConfigurationWASM, StateTransitionWASM, …) built in our
      // wasm memory can't be unwrapped as NAPI types by the extension's separate wasm
      // instance → "Failed to recover TokenConfigurationNAPI type from napi value".
      // The extension's signAndBroadcast accepts a base64 string of the state transition
      // and reconstructs internally in its own wasm — clean cross-context handoff.
      const { DashPlatformSDK } = await import('dash-platform-sdk/types')
      const sdk = new DashPlatformSDK({ network: network.name })

      return cacheSigner({
        method: SIGNER_METHODS.EXTENSION,
        identityId: wallet.currentIdentity,
        sdk,
        signAndBroadcast: (stateTransition: StateTransitionWASM) =>
          extension.signer.signAndBroadcast(stateTransition.base64()),
        sign: () => {
          throw new Error(
            'Sign-only is not supported via Extension yet — extension signs and broadcasts atomically'
          )
        }
      })
    } catch (e) {
      setError((e as Error)?.message ?? (e as Error)?.toString() ?? 'Failed to connect wallet')
      return null
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWithPrivateKey = async ({ wif, identityId }: ConnectParams) => {
    setIsConnecting(true)
    setError(null)

    try {
      const trimmedWif = wif?.trim()
      const trimmedIdentityId = identityId?.trim()
      if (!trimmedWif) throw new Error('Private key is required')

      const { DashPlatformSDK, PrivateKeyWASM, StateTransitionWASM } = await import('dash-platform-sdk/types')

      // Try WIF first (self-validating via fromWIF throw), then 64-char hex, then 32-byte base64.
      const parsePrivateKey = () => {
        try { return PrivateKeyWASM.fromWIF(trimmedWif) } catch {}

        if (/^[0-9a-fA-F]{64}$/.test(trimmedWif)) {
          try { return PrivateKeyWASM.fromHex(trimmedWif, network.name) } catch {}
        }

        if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmedWif)) {
          try {
            const bytes = Uint8Array.from(atob(trimmedWif), (c) => c.charCodeAt(0))
            if (bytes.length === 32) return PrivateKeyWASM.fromBytes(bytes, network.name)
          } catch {}
        }

        throw new Error('Invalid private key format (expected WIF, hex, or base64)')
      }

      const privateKey = parsePrivateKey()

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

      const refreshKey = async () => {
        const freshIdentity = await sdk.identities.getIdentityByIdentifier(identityIdStr)
        const freshKey = freshIdentity.getPublicKeys().find(
          (pk) => pk.getPublicKeyHash() === publicKeyHash
        )
        if (!freshKey) {
          throw new Error('Could not locate signing key on identity')
        }
        return freshKey
      }

      return cacheSigner({
        method: SIGNER_METHODS.PRIVATE_KEY,
        identityId: identityIdStr,
        sdk,
        sign: async (stateTransition: StateTransitionWASM) => {
          const freshKey = await refreshKey()
          const fresh = StateTransitionWASM.fromBase64(stateTransition.base64())
          fresh.signByPrivateKey(privateKey, freshKey.keyId, freshKey.keyType as KeyTypeArg)
          return fresh
        },
        signAndBroadcast: async (stateTransition: StateTransitionWASM) => {
          const freshKey = await refreshKey()
          const fresh = StateTransitionWASM.fromBase64(stateTransition.base64())
          fresh.signByPrivateKey(privateKey, freshKey.keyId, freshKey.keyType as KeyTypeArg)
          await sdk.stateTransitions.broadcast(fresh)
          return fresh
        }
      })
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to connect with private key')
      return null
    } finally {
      setIsConnecting(false)
    }
  }

  const connect = (params?: ConnectParams) => {
    if (method === SIGNER_METHODS.EXTENSION) return connectExtension()
    if (method === SIGNER_METHODS.PRIVATE_KEY) return connectWithPrivateKey(params ?? {})
    setError('Unknown signer method')
    return Promise.resolve(null)
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
