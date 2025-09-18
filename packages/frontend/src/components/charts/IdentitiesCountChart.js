'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../util'
import { defaultChartConfig } from './config'
import LineChartBlock from './LineChartBlock'

export default function IdentitiesCountChart ({ isActive, loading, timespanChangeCallback, className }) {
  const [identitiesHistory, setIdentitiesHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    const { start = null, end = null } = timespan?.range
    if (!start || !end) return

    setIdentitiesHistory(state => ({ ...state, loading: true }))

    Api.getIdentitiesHistory(start, end, timespan?.intervalsCount)
      .then(res => {
        console.log('identities res', res)
        fetchHandlerSuccess(setIdentitiesHistory, { resultSet: res })
      })
      .catch(err => fetchHandlerError(setIdentitiesHistory, err))
  }, [timespan])

  const handleTimespanChange = (newTimespan) => {
    setTimespan(newTimespan)
    if (timespanChangeCallback) {
      timespanChangeCallback(newTimespan)
    }
  }

  return (
    <LineChartBlock
      menuIsActive={isActive}
      timespanChange={handleTimespanChange}
      data={identitiesHistory.data?.resultSet?.map((item) => ({
        x: new Date(item.timestamp),
        y: item.data.registeredIdentities
      })) || []}
      loading={loading || identitiesHistory.loading}
      error={identitiesHistory.error}
      xAxis={{
        type: (() => {
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date', tooltip: 'datetime' }
          return { axis: 'time' }
        })()
      }}
      yAxis={{
        type: 'number',
        abbreviation: 'Identities'
      }}
      useInfoBlock={false}
      className={className || ''}
    />
  )
}
