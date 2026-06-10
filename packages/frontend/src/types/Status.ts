// Mirrors the response shape of GET /status in
// packages/api/src/controllers/MainController.js `getStatus`.

import type { Epoch } from './Epoch'

export interface StatusBlockRef {
  height: number | null
  hash: string | null
  timestamp: string | null
}

export interface StatusApi {
  version: string
  block: StatusBlockRef
}

export interface StatusTenderdash {
  version: string | null
  block: StatusBlockRef
}

export type IndexerSyncState = 'synced' | 'syncing'

export interface StatusIndexer {
  status: IndexerSyncState
  syncProgress: number
}

export interface StatusVersions {
  software: {
    dapi: string | null
    drive: string | null
    tenderdash: string | null
  }
  protocol: {
    tenderdash: {
      p2p: number | null
      block: number | null
    }
    drive: {
      latest: number | null
      current: number | null
    }
  }
}

export interface Status {
  epoch: Epoch | null
  transactionsCount: number | null
  totalCredits: string
  totalCollectedFeesDay: number | null
  transfersCount: number | null
  dataContractsCount: number | null
  documentsCount: number | null
  identitiesCount: number | null
  network: string | null
  api: StatusApi
  tenderdash: StatusTenderdash
  indexer: StatusIndexer
  versions: StatusVersions
}
