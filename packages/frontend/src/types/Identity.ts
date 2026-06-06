import type { Alias } from './Alias'

// Mirrors packages/api/src/models/Identity.js

export interface Identity {
  identifier: string
  owner: string
  revision: string
  balance: string
  timestamp: string | null
  txHash: string | null
  totalTxs: number
  totalDocuments: number
  totalDataContracts: number
  totalTransfers: number
  isSystem: boolean
  aliases: Alias[]
  totalGasSpent: number | null
  averageGasSpent: number | null
  totalTopUpsAmount: number | null
  totalWithdrawalsAmount: number | null
  lastWithdrawalHash: string | null
  publicKeys: unknown[]
  fundingCoreTx: string | null
  totalTopUps: number | null
  totalWithdrawals: number | null
  lastWithdrawalTimestamp: string | null
  nonce: string | null
}
