// Mirrors packages/api/src/models/Epoch.js
// Plain epoch info (number, range, fee multiplier).

export interface Epoch {
  number: number
  firstBlockHeight: string
  firstCoreBlockHeight: number
  startTime: number
  feeMultiplier: string
  endTime: number
}
