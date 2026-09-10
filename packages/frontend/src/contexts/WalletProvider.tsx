'use client'

import { createContext, useContext, useState, useRef } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// Minimal shape of the Dash Platform browser extension wallet response.
// Typed only for the fields this provider actually reads.
export interface WalletIdentity {
  identifier: string
  proTxHash?: string
}

export interface WalletInfo {
  identities?: WalletIdentity[]
  currentIdentity: string
  proTxHash?: string
}

interface DashPlatformExtensionSigner {
  connect: () => Promise<WalletInfo>
  // Extension signs and broadcasts atomically; receives the state transition as base64.
  signAndBroadcast: (base64: string) => Promise<unknown>
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
  connectWallet: () => Promise<void> | void
  connected: MutableRefObject<boolean>
  walletInfo: WalletInfo | null
  currentIdentity: string | null
  error: string | null
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextValue>({
  connectWallet: () => undefined,
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
  const connected = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [currentIdentity, setCurrentIdentity] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = () => {
    if (!window.dashPlatformExtension) {
      setError('Dash Platform Extension is not installed')
      return
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
          return
        }
        connected.current = true
        setWalletInfo({ ...wallet, proTxHash: current.proTxHash })
        setError(null)
        setCurrentIdentity(wallet.currentIdentity)
      })
      .catch((e: unknown) => {
        setError(e?.toString() || 'Failed to connect wallet')
      })
      .finally(() => setIsConnecting(false))
  }

  return (
    <WalletContext.Provider
      value={{ connectWallet, connected, walletInfo, currentIdentity, error, isConnecting }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextValue => useContext(WalletContext)
