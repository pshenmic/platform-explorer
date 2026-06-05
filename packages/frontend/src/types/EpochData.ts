import type { Epoch } from './Epoch'

// Mirrors packages/api/src/models/EpochData.js
// Full epoch payload returned by GET /epoch/:id (includes voting stats).

export interface VotingTotals {
  resourceValue: unknown | null
  totalCountTowardsIdentity: number
  totalCountAbstain: number
  totalCountLock: number
}

export interface BestVoter {
  identifier: string | null
  totalCountTowardsIdentity: number
  totalCountAbstain: number
  totalCountLock: number
}

export interface EpochData {
  epoch: Epoch
  tps: number
  totalCollectedFees: number
  bestValidator: string | null
  topVotedResource: VotingTotals
  bestVoter: BestVoter
  totalVotesCount: number
  totalVotesGasUsed: number
}
