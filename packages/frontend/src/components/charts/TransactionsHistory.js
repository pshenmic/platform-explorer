'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../util'
import { defaultChartConfig } from './config'
import LineChartBlock from './LineChartBlock'

export default function TransactionsHistory ({ heightPx = 300, blockBorders = true }) {
  const [transactionsHistory, setTransactionsHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    const { start = null, end = null } = timespan?.range
    if (!start || !end) return

    setTransactionsHistory(state => ({ ...state, loading: true }))

    Api.getTransactionsHistory(start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setTransactionsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setTransactionsHistory, err))
  }, [timespan])

  return (
    <LineChartBlock
        title={'Transactions history'}
        loading={transactionsHistory.loading}
        error={transactionsHistory.error}
        timespanChange={setTimespan}
        data={transactionsHistory.data?.resultSet?.map((item) => ({
          x: new Date(item.timestamp),
          y: item.data.txs
        })) || []}
        xAxis={{
          type: (() => {
            if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7) return { axis: 'date' }
            if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3) return { axis: 'date', tooltip: 'datetime' }
            return { axis: 'time' }
          })(),
          abbreviation: '',
          title: ''
        }}
        yAxis={{
          type: 'number',
          title: '',
          abbreviation: 'txs'
        }}
        heightPx={heightPx}
        blockBorders={blockBorders}
    />
  )
}
