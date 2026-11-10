import type { DateRangeFilterValue } from '../components/filters/types'
import type { ValidatorPendingEpochReward } from '../types/Validator'

export function validatorCurrentEpochReward(
  pending: ValidatorPendingEpochReward | null | undefined,
  epoch: number | undefined
) {
  if (epoch == null || pending?.epoch !== epoch || typeof pending.reward !== 'string') return null
  if (!/^\d+$/.test(pending.reward)) return null
  const reward = Number(pending.reward)
  return Number.isSafeInteger(reward) && reward >= 0 ? reward : null
}

export function validatorChartDateLabel(
  timestamp: string | null,
  start: string | null,
  end: string | null
) {
  if (!timestamp || !start || !end) return '—'
  const date = new Date(timestamp)
  const first = new Date(start)
  const last = new Date(end)
  if (![date, first, last].every(value => Number.isFinite(value.getTime()))) return '—'
  const shortRange = last.getTime() - first.getTime() <= 48 * 3600000
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: shortRange ? '2-digit' : 'short',
    ...(shortRange ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
    ...(first.getUTCFullYear() !== last.getUTCFullYear() ? { year: '2-digit' } : {})
  }).format(date)
}

export function validatorChartRange(selection: DateRangeFilterValue, now: number, allStart: Date) {
  if (!selection.start || !selection.end) return null
  const start = new Date(selection.start)
  const end = new Date(selection.end)
  if (selection.mode === 'rolling') {
    if (start.getTime() !== allStart.getTime()) {
      start.setTime(now - (end.getTime() - start.getTime()))
    }
    end.setTime(now)
  } else {
    start.setHours(0, 0, 0, 0)
    end.setHours(24, 0, 0, 0)
  }
  return {
    start: new Date(Math.floor(start.getTime() / 60000) * 60000).toISOString(),
    end: new Date(Math.floor(Math.min(end.getTime(), now) / 60000) * 60000).toISOString()
  }
}

export function validatorChartHistory<
  Point extends {
    data: { reward: number | null; endTime: string | null; blocksProposed: number } | null
  }
>(points: Point[]) {
  const firstKnown = points.findIndex(
    point => point.data && (point.data.reward != null || point.data.endTime == null)
  )
  return {
    visiblePoints: firstKnown < 0 ? [] : points.slice(firstKnown),
    totalBlocks: points.reduce((sum, point) => sum + (point.data?.blocksProposed ?? 0), 0)
  }
}
