import { getDynamicRange } from '../../util'
import type { ChartConfig } from './types'

export const defaultIntervalsCount = 100

export const defaultChartConfig: ChartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '24 hours',
        durationMs: 24 * 60 * 60 * 1000,
        range: getDynamicRange(24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '3 days',
        durationMs: 3 * 24 * 60 * 60 * 1000,
        range: getDynamicRange(3 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '1 week',
        durationMs: 7 * 24 * 60 * 60 * 1000,
        range: getDynamicRange(7 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '1 Month',
        durationMs: 30 * 24 * 60 * 60 * 1000,
        range: getDynamicRange(30 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      }
    ]
  }
}
