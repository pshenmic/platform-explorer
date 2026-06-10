// Mirrors packages/api/src/models/Vote.js

import type { Alias } from './Alias'

export type VoteChoice = 'TowardsIdentity' | 'Abstain' | 'Lock'

export interface Vote {
  proTxHash: string | null
  txHash: string | null
  voterIdentifier: string | null
  choice: VoteChoice | string | null
  timestamp: string | null
  towardsIdentity: string | null
  identityAliases: Alias[] | null
  dataContractIdentifier: string | null
  documentTypeName: string | null
  documentIdentifier: string | null
  indexName: string | null
  indexValues: string[] | null
  power: number | null
}
