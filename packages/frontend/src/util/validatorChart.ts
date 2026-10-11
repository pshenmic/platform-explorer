import type { DateRangeFilterValue } from '../components/filters/types'

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

export function validatorChartHistory<Point extends {
  data: { reward: number | null; endTime: string | null; blocksProposed: number } | null
}>(points: Point[]) {
  const firstKnown = points.findIndex(point => point.data &&
    (point.data.reward != null || point.data.endTime == null))
  return {
    visiblePoints: firstKnown < 0 ? [] : points.slice(firstKnown),
    totalBlocks: points.reduce((sum, point) => sum + (point.data?.blocksProposed ?? 0), 0)
  }
}
