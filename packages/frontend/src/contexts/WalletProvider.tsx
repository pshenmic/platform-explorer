'use client'

import { createContext, useContext, useState, useRef, useMemo } from 'react'
import type { MutableRefObject, ReactNode } from 'react'
import type { DashPlatformSDK } from 'dash-platform-sdk/types'
import { useActiveNetwork } from './NetworkProvider'

// Minimal shape of the Dash Platform browser extension wallet response.
// Typed only for the fields this provider actually reads.
export interface WalletIdentity {
  identifier: string
  proTxHash?: string | null
}

export interface WalletInfo {
  identities?: WalletIdentity[]
  currentIdentity: string | null
  proTxHash?: string | null
}

export interface SignedStateTransitionData {
  signedHash: string
  signedBase64: string
}

interface DashPlatformExtensionSigner {
  connect: () => Promise<WalletInfo>
  // Extension signs and broadcasts atomically; receives the state transition as base64.
  signAndBroadcast: (base64: string) => Promise<SignedStateTransitionData>
}

interface DashPlatformExtension {
  signer: DashPlatformExtensionSigner
}

declare global {
  interface Window {
    dashPlatformExtension?: DashPlatformExtension
  }
}

export interface WalletContextValue {
  connectWallet: () => Promise<WalletInfo | null>
  getSDK: () => Promise<DashPlatformSDK>
  connected: MutableRefObject<boolean>
  walletInfo: WalletInfo | null
  currentIdentity: string | null
  error: string | null
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextValue>({
  connectWallet: async () => null,
  getSDK: async () => {
    throw new Error('WalletProvider is not available')
  },
  connected: { current: false },
  walletInfo: null,
  currentIdentity: null,
  error: null,
  isConnecting: false
})

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const network = useActiveNetwork()
  const getSDK = useMemo(() => {
    let sdkPromise: Promise<DashPlatformSDK> | undefined
    return () => {
      sdkPromise ??= import('dash-platform-sdk/types')
        .then(({ DashPlatformSDK }) => new DashPlatformSDK({ network: network.name }))
        .catch(error => {
          sdkPromise = undefined
          throw error
        })
      return sdkPromise
    }
  }, [network.name])
  const connected = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [currentIdentity, setCurrentIdentity] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      setError('Dash Platform Extension is not installed')
      return Promise.resolve(null)
    }

    const { dashPlatformExtension } = window

    setIsConnecting(true)
    return dashPlatformExtension.signer
      .connect()
      .then(wallet => {
        const current = wallet.identities?.find(
          ({ identifier }) => identifier === wallet.currentIdentity
        )
        if (!current) {
          setError('Wallet connection returned no current identity')
          return null
        }
        connected.current = true
        setWalletInfo({ ...wallet, proTxHash: current.proTxHash })
        setError(null)
        setCurrentIdentity(wallet.currentIdentity)
        return { ...wallet, proTxHash: current.proTxHash }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e))
        return null
      })
      .finally(() => setIsConnecting(false))
  }

  return (
    <WalletContext.Provider
      value={{ connectWallet, getSDK, connected, walletInfo, currentIdentity, error, isConnecting }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextValue => useContext(WalletContext)
