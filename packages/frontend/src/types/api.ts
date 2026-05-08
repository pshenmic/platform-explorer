// Response types for the platform-explorer API.
// Extended incrementally as components get migrated.

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedResultSet<T> {
  resultSet: T[]
  pagination: Pagination
}

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

export interface Block {
  header: BlockHeader
  txs: string[]
}

export type TransactionStatus = 'SUCCESS' | 'FAIL'

export type TransitionType =
  | 'BATCH'
  | 'IDENTITY_CREATE'
  | 'IDENTITY_TOPUP'
  | 'IDENTITY_UPDATE'
  | 'DATA_CONTRACT_CREATE'
  | 'DATA_CONTRACT_UPDATE'
  | 'IDENTITY_CREDIT_TRANSFER'
  | 'IDENTITY_CREDIT_WITHDRAWAL'
  | 'MASTERNODE_VOTE'
  | 'TOKEN_TRANSFER'

export interface Alias {
  alias: string
  status: string
  timestamp: string
  documentId: string
  contested: boolean
}

export interface Owner {
  identifier: string
  aliases: Alias[]
}

export interface Transaction {
  hash: string
  index: number
  blockHash: string
  blockHeight: number
  type: TransitionType
  batchType: string | null
  data: string
  timestamp: string
  gasUsed: number
  status: TransactionStatus
  error: string | null
  owner: Owner | null
}
