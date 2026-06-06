import type { Owner } from './Owner'

// Mirrors packages/api/src/models/Document.js
// Note: backend model declares `owner: string` but the API response is
// enriched to a full Owner object (with aliases) in the controller layer.

export type DocumentTransitionType =
  | 'DOCUMENT_CREATE'
  | 'DOCUMENT_REPLACE'
  | 'DOCUMENT_DELETE'
  | 'DOCUMENT_TRANSFER'
  | 'DOCUMENT_UPDATE_PRICE'
  | 'DOCUMENT_PURCHASE'

export interface Document {
  identifier: string
  dataContractIdentifier: string
  revision: number
  txHash: string | null
  deleted: boolean
  data: string
  timestamp: string | null
  system: boolean
  entropy: string | null
  prefundedVotingBalance: string | null
  documentTypeName: string
  transitionType: DocumentTransitionType
  identityContractNonce: string | null
  gasUsed: number | null
  totalGasUsed: number | null
  owner: Owner
}
