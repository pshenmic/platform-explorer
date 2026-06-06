import type { DistributionFunction } from './DistributionFunction'

// Mirrors packages/api/src/models/PerpetualDistribution.js

export interface PerpetualDistribution {
  type: string | null
  recipientType: string | null
  recipientValue: unknown | null
  interval: number | null
  functionName: string | null
  functionValue: DistributionFunction | null
}
