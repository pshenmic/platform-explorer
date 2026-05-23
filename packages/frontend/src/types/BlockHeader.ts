// Mirrors packages/api/src/models/BlockHeader.js

export interface BlockHeader {
  hash: string
  height: number
  timestamp: string
  blockVersion: number
  appVersion: number
  l1LockedHeight: number
  validator: string
  totalGasUsed: number
  appHash: string
}
