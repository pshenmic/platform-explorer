// Mirrors packages/api/src/models/PreProgrammedDistribution.js

export interface PreProgrammedDistributionOut {
  identifier: string
  tokenAmount: string
}

export interface PreProgrammedDistribution {
  timestamp: Date | null
  out: PreProgrammedDistributionOut[] | null
}
