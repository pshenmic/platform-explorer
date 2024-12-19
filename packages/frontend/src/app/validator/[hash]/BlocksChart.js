import * as Api from '../../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../../util'
import TabsChartBlock from '../../../components/charts/TabsChartBlock'
import { defaultChartConfig } from '../../../components/charts/config'

export default function BlocksChart ({ hash, isActive }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    const { start = null, end = null } = timespan?.range
    if (!start || !end) return

    setBlocksHistory(state => ({ ...state, loading: true }))

    Api.getBlocksStatsByValidator(hash, start, end)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan, hash])

  return (
    <TabsChartBlock
      menuIsActive={isActive}
      timespanChangeCallback={setTimespan}
      timespan={timespan}
      data={blocksHistory.data?.resultSet?.map((item) => ({
        x: new Date(item.timestamp),
        y: item.data.blocksCount
      })) || []}
      loading={blocksHistory.loading}
      error={blocksHistory.error}
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
