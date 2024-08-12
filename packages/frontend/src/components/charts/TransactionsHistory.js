'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import LineChartBlock from './LineChartBlock'

const transactionsChartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

export default function TransactionsHistory ({ height = '220px' }) {
  const [transactionsHistory, setTransactionsHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(transactionsChartConfig.timespan.default)

  useEffect(() => {
    Api.getTransactionsHistory(timespan)
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
            if (timespan === '1h') return { axis: 'time' }
            if (timespan === '24h') return { axis: 'time' }
            if (timespan === '3d') return { axis: 'date', tooltip: 'datetime' }
            if (timespan === '1w') return { axis: 'date' }
          })(),
          abbreviation: '',
          title: ''
        }}
        yAxis={{
          type: 'number',
          title: '',
          abbreviation: 'txs'
        }}
        height={height}
    />
  )
}
