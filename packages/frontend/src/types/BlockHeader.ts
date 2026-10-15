// Mirrors packages/api/src/models/BlockHeader.js

export interface BlockHeader {
  hash: string
  height: number
  timestamp: string
  blockVersion: number
  appVersion: number
  l1LockedHeight: number
  l1LockedBlockHash?: string | null
  validator: string
  totalGasUsed: number
  appHash: string
}
