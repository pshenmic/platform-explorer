// Mirrors packages/api/src/models/PlatformAddress.js

export interface PlatformAddress {
  base58Address: string
  bech32mAddress: string
  totalTxs: number
  incomingTxs: number
  outgoingTxs: number
  nonce: number | null
  balance: number | null
  totalIncomingAmount: number | null
  totalOutgoingAmount: number | null
}
