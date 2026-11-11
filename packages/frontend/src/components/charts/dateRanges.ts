import type { DateRangeFilterValue } from '../filters/types'

const DAY = 24 * 60 * 60 * 1000

export const CHART_PRESETS = [
  { label: '24h', ms: DAY, intervals: 48 },
  { label: '1W', ms: 7 * DAY, intervals: 84 },
  { label: '1M', ms: 30 * DAY, intervals: 100 },
  { label: '3M', ms: 90 * DAY, intervals: 100 },
  { label: '6M', ms: 182 * DAY, intervals: 100 },
  { label: '1Y', ms: 365 * DAY, intervals: 100 },
  { label: 'All', start: '2024-01-01T00:00:00.000Z', intervals: 100 }
]

export interface ChartRange {
  start: string
  end: string
  ms: number
  intervals: number
  label: string
  isAll: boolean
}

export function chartPresetValue(label: string): DateRangeFilterValue | null {
  const preset = CHART_PRESETS.find(option => option.label === label)
  if (!preset?.ms) return null
  const end = new Date()
  return { start: new Date(end.getTime() - preset.ms), end, mode: 'rolling' }
}

export function chartRangeLabel(value: DateRangeFilterValue | null) {
  if (!value?.start || !value.end) return 'All time'
  if (value.mode === 'rolling') {
    const duration = value.end.getTime() - value.start.getTime()
    const preset = CHART_PRESETS.find(option => option.ms === duration)
    if (preset) return preset.label
  }
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
  const start = format(value.start)
  const end = format(value.end)
  return start === end ? start : `${start} – ${end}`
}

export function resolveChartRange(
  value: DateRangeFilterValue | null,
  { now = Date.now(), roundToHour = true }: { now?: number; roundToHour?: boolean } = {}
): ChartRange {
  const isAll = !value?.start || !value.end
  const rollingEnd = roundToHour ? Math.ceil(now / 3600000) * 3600000 : now
  let start = new Date(CHART_PRESETS[CHART_PRESETS.length - 1].start!)
  let end = new Date(rollingEnd)
  if (!isAll) {
    start = new Date(value.start!)
    end = new Date(value.end!)
    if (value.mode === 'rolling') {
      const duration = end.getTime() - start.getTime()
      end = new Date(rollingEnd)
      start = new Date(rollingEnd - duration)
    } else {
      if (start > end) [start, end] = [end, start]
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      end = new Date(Math.min(end.getTime(), now))
    }
  }
  const ms = end.getTime() - start.getTime()
  const preset =
    value?.mode === 'rolling' ? CHART_PRESETS.find(option => option.ms === ms) : undefined
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    ms,
    intervals: isAll ? 100 : (preset?.intervals ?? (ms <= DAY ? 48 : ms <= 7 * DAY ? 84 : 100)),
    label: chartRangeLabel(value),
    isAll
  }
}
