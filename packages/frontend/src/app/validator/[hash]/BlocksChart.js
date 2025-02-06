import * as Api from '../../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../../util'
import TabsChartBlock from '../../../components/charts/TabsChartBlock'

export default function BlocksChart ({ hash, isActive, loading, timespan, timespanChangeCallback }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    const { start = null, end = null } = timespan?.range
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
        x: new Date(item.timestamp),
        y: item.data.blocksCount
      })) || []}
      loading={loading || blocksHistory.loading}
      error={!hash || blocksHistory.error}
      xAxis={{
        type: (() => {
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date', tooltip: 'datetime' }
          return { axis: 'time' }
        })()
      }}
      yAxis={{
        type: 'number',
        abbreviation: 'blocks'
      }}
    />
  )
}
