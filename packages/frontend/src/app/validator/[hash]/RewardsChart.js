import * as Api from '../../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../../util'
import TabsChartBlock from '../../../components/charts/TabsChartBlock'
import { defaultChartConfig } from '../../../components/charts/config'

export default function RewardsChart ({ hash, isActive }) {
  const [rewardsHistory, setRewardsHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    const { start = null, end = null } = timespan?.range
    if (!start || !end) return

    setRewardsHistory(state => ({ ...state, loading: true }))

    Api.getRewardsStatsByValidator(hash, start, end)
      .then(res => fetchHandlerSuccess(setRewardsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setRewardsHistory, err))
  }, [timespan, hash])

  return (
    <TabsChartBlock
      isActive={isActive}
      timespanChangeCallback={setTimespan}
      timespan={timespan}
      data={rewardsHistory.data?.resultSet?.map((item) => ({
        x: new Date(item.timestamp),
        y: item.data.reward
      })) || []}
      loading={rewardsHistory.loading}
      error={rewardsHistory.error}
      xAxis={{
        type: (() => {
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date', tooltip: 'datetime' }
          return { axis: 'time' }
        })()
      }}
      yAxis={{
        type: 'number',
        abbreviation: 'Credits'
      }}
    />
  )
}
