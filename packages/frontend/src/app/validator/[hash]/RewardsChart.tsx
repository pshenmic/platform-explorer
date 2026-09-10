import * as Api from '../../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../../util'
import TabsChartBlock from '../../../components/charts/TabsChartBlock'
import type { TimespanValue } from '../../../components/charts/types'
import type { LoadableState, SeriesData } from '../../../types'

interface RewardsStatsPoint {
  reward: number
}

interface RewardsChartProps {
  hash: string
  isActive?: boolean
  loading?: boolean
  timespan?: TimespanValue
  timespanChangeCallback?: (value: TimespanValue) => void
}

export default function RewardsChart({
  hash,
  isActive,
  loading,
  timespan,
  timespanChangeCallback
}: RewardsChartProps) {
  const [rewardsHistory, setRewardsHistory] = useState<
    LoadableState<{ resultSet?: Array<SeriesData<RewardsStatsPoint>> }>
  >({
    data: {},
    loading: true,
    error: false
  })

  useEffect(() => {
    const { start = null, end = null } = timespan?.range ?? {}
    if (!start || !end) return

    setRewardsHistory(state => ({ ...state, loading: true }))

    Api.getRewardsStatsByValidator(hash, start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setRewardsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setRewardsHistory, err))
  }, [timespan, hash])

  return (
    <TabsChartBlock
      menuIsActive={isActive}
      timespanChangeCallback={timespanChangeCallback}
      timespan={timespan}
      data={
        rewardsHistory.data?.resultSet?.map(item => ({
          x: new Date(item.timestamp ?? 0),
          y: item.data?.reward ?? 0
        })) || []
      }
      loading={loading || rewardsHistory.loading}
      error={!hash || rewardsHistory.error}
      xAxis={{
        type: (() => {
          if (!timespan?.range?.start || !timespan?.range?.end) return { axis: 'time' as const }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7)
            return { axis: 'date' as const }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3)
            return { axis: 'date' as const, tooltip: 'datetime' as const }
          return { axis: 'time' as const }
        })()
      }}
      yAxis={{
        type: 'number',
        abbreviation: 'Credits'
      }}
    />
  )
}
