import * as Api from '../../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../../util'
import TabsChartBlock from '../../../components/charts/TabsChartBlock'
import type { TimespanValue } from '../../../components/charts/types'
import type { LoadableState, SeriesData } from '../../../types'

interface BlocksStatsPoint {
  blocksCount: number
}

interface BlocksChartProps {
  hash: string
  isActive?: boolean
  loading?: boolean
  timespan?: TimespanValue
  timespanChangeCallback?: (value: TimespanValue) => void
}

export default function BlocksChart ({ hash, isActive, loading, timespan, timespanChangeCallback }: BlocksChartProps) {
  const [blocksHistory, setBlocksHistory] = useState<LoadableState<{ resultSet?: Array<SeriesData<BlocksStatsPoint>> }>>({
    data: {},
    loading: true,
    error: false
  })

  useEffect(() => {
    const { start = null, end = null } = timespan?.range ?? {}
    if (!start || !end) return

    setBlocksHistory(state => ({ ...state, loading: true }))

    Api.getBlocksStatsByValidator(hash, start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan, hash])

  return (
    <TabsChartBlock
      menuIsActive={isActive}
      timespanChangeCallback={timespanChangeCallback}
      timespan={timespan}
      data={blocksHistory.data?.resultSet?.map((item) => ({
        x: new Date(item.timestamp ?? 0),
        y: item.data?.blocksCount ?? 0
      })) || []}
      loading={loading || blocksHistory.loading}
      error={!hash || blocksHistory.error}
      xAxis={{
        type: (() => {
          if (!timespan?.range?.start || !timespan?.range?.end) return { axis: 'time' as const }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' as const }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date' as const, tooltip: 'datetime' as const }
          return { axis: 'time' as const }
        })()
      }}
      yAxis={{
        type: 'number',
        abbreviation: 'blocks'
      }}
    />
  )
}
