// Mirrors packages/api/src/models/Transfer.js

export interface Transfer {
  amount: number | null
  sender: string | null
  recipient: string | null
  timestamp: string | null
  txHash: string | null
  type: string | null
  blockHash: string | null
  gasUsed: number | null
}
