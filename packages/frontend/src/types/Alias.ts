// Mirrors packages/api/src/models/Alias.js

export interface Alias {
  alias: string
  status: string
  contested: boolean
  timestamp: string
  // API enrichments — present on responses where alias references a document.
  documentId?: string
  txHash?: string
}
