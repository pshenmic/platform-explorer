// Mirrors packages/api/src/models/ContestedResource.js

export interface ContestedResource {
  contenders: unknown[] | null
  indexName: string
  resourceValue: string[]
  dataContractIdentifier: string
  prefundedVotingBalance: string | null
  documentTypeName: string
  timestamp: string
  totalGasUsed: string | null
  totalDocumentsGasUsed: string | null
  totalVotesGasUsed: string | null
  totalCountVotes: number
  totalCountLock: number
  totalCountAbstain: number
  totalCountTowardsIdentity: number
  status: string | null
  endTimestamp: string
  finished: boolean
  towardsIdentity: string | null
}
