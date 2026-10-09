// Mirrors packages/api/src/models/Validator.js

import type { BlockHeader } from './BlockHeader'
import type { EpochData } from './EpochData'
import type { ProTxInfo } from './ProTxInfo'

export interface ValidatorEndpoints {
  coreP2PPortStatus?: { host: string; port: number; status: string; message?: string | null } | null
  platformP2PPortStatus?: {
    host: string
    port: number
    status: string
    message?: string | null
  } | null
  platformGrpcPortStatus?: {
    host: string
    port: number
    status: string
    message?: string | null
  } | null
}

export interface GeoIpInfo {
  ipv4?: string | null
  countryCode?: string | null
  city?: string | null
}

export interface Validator {
  proTxHash: string | null
  isActive: boolean | null
  isRegistered?: boolean | null
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
  geoIpInfo?: GeoIpInfo | null
  registeredAt?: string | null
  registeredCoreBlockHash?: string | null
  lastPaidCoreBlockHash?: string | null
  poseRevivedCoreBlockHash?: string | null
  poseBanCoreBlockHash?: string | null
  poseScoreMax?: number | null
  votingIdentity?: string | null
  votingIdentityBalance?: string | null
  coreYieldPerYear?: number | null
  coreTipTime?: string | null
  coreBlockIntervalMs?: number | null
  blocksUntilCorePayment?: number | null
}
