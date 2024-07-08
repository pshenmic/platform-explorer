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
  const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)

  useEffect(() => {
    Api.getTransactionsHistory(transactionsTimespan)
      .then(res => fetchHandlerSuccess(setTransactionsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setTransactionsHistory, err))
  }, [transactionsTimespan])

  return (
    <LineChartBlock
        title={'Transactions history'}
        items={transactionsHistory}
        timespanChange={setTransactionsTimespan}
    />
  )
}
