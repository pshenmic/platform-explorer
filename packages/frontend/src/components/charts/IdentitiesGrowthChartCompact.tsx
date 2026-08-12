'use client'

import { useState, useEffect } from 'react'
import type { LoadableState, WithClassName } from '../../types/common'
import type { SeriesData } from '../../types'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../util'
import { defaultChartConfig } from './config'
import type { TimespanValue } from './types'
import { LineChart } from './index'
import './TransactionsChartCompact.css'

interface IdentityHistoryPoint {
  registeredIdentities: number
}

const timeframes: TimespanValue[] = defaultChartConfig.timespan.values.map((value, index) => ({
  ...value,
  short: (['24H', '3D', '1W', '1M'] as const)[index] || value.label
}))

export default function IdentitiesGrowthChartCompact ({ className }: WithClassName) {
  const [history, setHistory] = useState<LoadableState<{ resultSet?: Array<SeriesData<IdentityHistoryPoint>> }>>({
    data: {},
    loading: true,
    error: false
  })
  const [timespan, setTimespan] = useState<TimespanValue>(
    timeframes[defaultChartConfig.timespan.defaultIndex]
  )

  useEffect(() => {
    const { start = null, end = null } = timespan?.range || {}
    if (!start || !end) return

    setHistory(state => ({ ...state, loading: true }))

    Api.getIdentitiesHistory(start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setHistory, err))
  }, [timespan])

  const data = history.data?.resultSet?.map(item => ({
    x: new Date(item.timestamp ?? 0),
    y: item.data?.registeredIdentities ?? 0
  })) || []

  const xAxis = {
    type: (() => {
      const days = getDaysBetweenDates(timespan.range.start, timespan.range.end)
      if (days > 7) return { axis: 'date' as const }
      if (days > 3) return { axis: 'date' as const, tooltip: 'datetime' as const }
      return { axis: 'time' as const }
    })(),
    abbreviation: '',
    title: ''
  }

  const yAxis = { type: 'number' as const, title: '', abbreviation: 'identities' }

  return (
    <div className={`TransactionsChartCompact ${className || ''}`}>
      <div className={'TransactionsChartCompact__Header'}>
        <span className={'TransactionsChartCompact__Title'}>Identities growth</span>
        <div className={'TransactionsChartCompact__Timeframes'}>
          {timeframes.map((tf, index) => (
            <button
              type={'button'}
              key={index}
              className={`TransactionsChartCompact__Pill ${tf.label === timespan.label ? 'TransactionsChartCompact__Pill--Active' : ''}`}
              onClick={() => setTimespan(tf)}
            >
              {tf.short}
            </button>
          ))}
        </div>
      </div>

      <div className={'TransactionsChartCompact__Chart'}>
        {!history.loading
          ? (!history.error && data.length)
              ? <LineChart data={data} timespan={timespan} xAxis={xAxis} yAxis={yAxis}/>
              : <div className={'TransactionsChartCompact__Empty'}>No data</div>
          : <div className={'TransactionsChartCompact__Loader'}/>}
      </div>
    </div>
  )
}
