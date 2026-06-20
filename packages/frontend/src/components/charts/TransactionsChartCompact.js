'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../util'
import { defaultChartConfig } from './config'
import { LineChart } from './index'
import './TransactionsChartCompact.scss'

const timeframes = defaultChartConfig.timespan.values.map((value, index) => ({
  ...value,
  short: ['24H', '3D', '1W', '1M'][index] || value.label
}))

export default function TransactionsChartCompact ({ className }) {
  const [history, setHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(timeframes[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    const { start = null, end = null } = timespan?.range || {}
    if (!start || !end) return

    setHistory(state => ({ ...state, loading: true }))

    Api.getTransactionsHistory(start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setHistory, err))
  }, [timespan])

  const data = history.data?.resultSet?.map(item => ({
    x: new Date(item.timestamp),
    y: item.data.txs
  })) || []

  const xAxis = {
    type: (() => {
      const days = getDaysBetweenDates(timespan.range.start, timespan.range.end)
      if (days > 7) return { axis: 'date' }
      if (days > 3) return { axis: 'date', tooltip: 'datetime' }
      return { axis: 'time' }
    })(),
    abbreviation: '',
    title: ''
  }

  const yAxis = { type: 'number', title: '', abbreviation: 'txs' }

  return (
    <div className={`TransactionsChartCompact ${className || ''}`}>
      <div className={'TransactionsChartCompact__Header'}>
        <span className={'TransactionsChartCompact__Title'}>Transactions history</span>
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
