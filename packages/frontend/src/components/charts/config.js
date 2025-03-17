import { getDynamicRange } from '../../util'

export const defaultIntervalsCount = 100

export const defaultChartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '24 hours',
        range: getDynamicRange(24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '3 days',
        range: getDynamicRange(3 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '1 week',
        range: getDynamicRange(7 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      },
      {
        label: '1 Month',
        range: getDynamicRange(30 * 24 * 60 * 60 * 1000),
        intervalsCount: defaultIntervalsCount
      }
    ]
  }
}
