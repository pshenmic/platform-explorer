import type { Network } from 'dash-platform-sdk/types'

export const NETWORKS_ENUM = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
} as const satisfies Record<string, Network>

export interface NetworkOption {
  name: Network
  subname: string
  disabled: boolean
  explorerBaseUrl: string | undefined
  l1explorerBaseUrl: string | undefined
  dataContractPE: string | undefined
}

export const NETWORK_OPTIONS: Record<string, NetworkOption> = {
  [NETWORKS_ENUM.MAINNET]: {
    name: NETWORKS_ENUM.MAINNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: process.env.NEXT_PUBLIC_MAINNET_BASE_URL,
    l1explorerBaseUrl: process.env.NEXT_PUBLIC_MAINNET_INSIGHT_URL,
    dataContractPE: process.env.NEXT_PUBLIC_MAINNET_PLATFORM_EXPLORER_DATA_CONTRACT_IDENTITY
  },
  [NETWORKS_ENUM.TESTNET]: {
    name: NETWORKS_ENUM.TESTNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: process.env.NEXT_PUBLIC_TESTNET_BASE_URL,
    l1explorerBaseUrl: process.env.NEXT_PUBLIC_TESTNET_INSIGHT_URL,
    dataContractPE: process.env.NEXT_PUBLIC_TESTNET_PLATFORM_EXPLORER_DATA_CONTRACT_IDENTITY
  }
}

export const networks = [
  NETWORK_OPTIONS[NETWORKS_ENUM.MAINNET],
  NETWORK_OPTIONS[NETWORKS_ENUM.TESTNET]
]
