// Mirrors packages/api/src/models/DataContract.js

export interface DataContractGroup {
  position: number
  members: unknown
  requiredPower: number
}

export interface DataContract {
  identifier: string
  name: string | null
  owner: string
  schema: string | null
  version: number
  txHash: string | null
  timestamp: string | null
  isSystem: boolean
  documentsCount: number
  tokensCount: number
  topIdentity: string | null
  identitiesInteracted: number | null
  totalGasUsed: number | null
  averageGasUsed: number | null
  groups: DataContractGroup[] | null
  tokens: unknown[] | null
  description: string | null
  keywords: string[]
}
