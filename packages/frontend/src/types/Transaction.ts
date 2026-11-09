// Mirrors packages/api/src/models/Transaction.js

import type { Owner } from './Owner'
import type { TransactionTypesInfo } from '../enums/state.transition.type'

export type TransactionStatus = 'SUCCESS' | 'FAIL'

export type TransitionType = keyof typeof TransactionTypesInfo

export interface TransactionDuplicate {
  hash: string
  blockHeight: number
}

export interface Transaction {
  hash: string | null
  index: number | null
  blockHash: string | null
  blockHeight: number | null
  type: TransitionType | null
  batchType: string | null
  data: string | null
  timestamp: string | null
  gasUsed: number | null
  status: TransactionStatus | null
  error: string | null
  owner: Owner | null
  incoming: boolean | null
  base58Address: string | null
  bech32mAddress: string | null
  duplicates: TransactionDuplicate[] | null
}
