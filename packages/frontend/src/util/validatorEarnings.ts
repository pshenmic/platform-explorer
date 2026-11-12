import type { Epoch } from '../types/Epoch'
import type { ValidatorPendingEpochReward } from '../types/Validator'
import { creditsToDash } from './index'

export function validatorPlatformMonthly(
  pending: ValidatorPendingEpochReward | null | undefined,
  epoch: Epoch | null | undefined,
  stopped: boolean
): number | null {
  if (
    !epoch ||
    pending?.epoch !== epoch.number ||
    !Number.isSafeInteger(pending.proposedBlocks) ||
    pending.proposedBlocks < 0 ||
    !Number.isFinite(epoch.startTime) ||
    !Number.isFinite(epoch.endTime) ||
    epoch.endTime <= epoch.startTime
  )
    return null
  if (pending.proposedBlocks === 0) return 0
  const value = stopped ? pending.reward : pending.estimatedReward
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null
  const credits = Number(value)
  if (!Number.isSafeInteger(credits) || credits < 0) return null
  const monthly = (creditsToDash(credits) * 30 * 86400000) / (epoch.endTime - epoch.startTime)
  return Number.isFinite(monthly) ? monthly : null
}
