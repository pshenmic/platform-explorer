// Mirrors packages/api/src/models/Validator.js

import type { BlockHeader } from './BlockHeader'
import type { EpochData } from './EpochData'
import type { ProTxInfo } from './ProTxInfo'

export interface ValidatorEndpoints {
  coreP2PPortStatus?: { host: string; port: number; status: string } | null
  platformP2PPortStatus?: { host: string; port: number; status: string } | null
  platformGrpcPortStatus?: { host: string; port: number; status: string } | null
}

export interface Validator {
  proTxHash: string | null
  isActive: boolean | null
  proposedBlocksAmount: number | null
  lastProposedBlockHeader: BlockHeader | null
  proTxInfo: ProTxInfo | null
  identity: string | null
  identityBalance: string | null
  epochInfo: EpochData | null
  totalReward: number | null
  epochReward: number | null
  withdrawalsCount: number | null
  lastWithdrawal: string | null
  lastWithdrawalTime: string | null
  endpoints: ValidatorEndpoints | null
}
