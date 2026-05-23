// Mirrors packages/api/src/models/DistributionFunction.js
// Many fields are conditionally set (depending on distribution variant), all
// optional. Large integers come as strings.

export interface DistributionFunction {
  amount?: string
  min?: string
  max?: string
  stepCount?: number
  decreasePerIntervalNumerator?: number
  decreasePerIntervalDenominator?: number
  startDecreasingOffset?: string | null
  maxIntervalCount?: number | null
  distributionStartAmount?: string
  trailingDistributionIntervalAmount?: string
  a?: string
  b?: string
  d?: string
  m?: string
  n?: string
  o?: string
  p?: string
  startStep?: string | null
  startingAmount?: string
  minValue?: string | null
  maxValue?: string | null
  startMoment?: string | null
}
