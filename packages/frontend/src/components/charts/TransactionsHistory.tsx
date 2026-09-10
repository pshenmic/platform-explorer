'use client'

import { useState, useEffect } from 'react'
import type { LoadableState } from '../../types/common'
import type { SeriesData } from '../../types'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getDaysBetweenDates } from '../../util'
import { defaultChartConfig } from './config'
import type { ChartRenderType, TimespanValue } from './types'
import LineChartBlock from './LineChartBlock'

interface TxHistoryPoint {
  txs: number
  blockHeight: number | null
  blockHash: string | null
}

interface TransactionsHistoryProps {
  heightPx?: number
  blockBorders?: boolean
  useInfoBlock?: boolean
  menuIsActive?: boolean
  title?: string
  type?: ChartRenderType
}

export default function TransactionsHistory({
  heightPx = 300,
  blockBorders = true,
  useInfoBlock = true,
  menuIsActive = true,
  title = 'Transactions history',
  type = 'line'
}: TransactionsHistoryProps) {
  const [transactionsHistory, setTransactionsHistory] = useState<
    LoadableState<{ resultSet?: Array<SeriesData<TxHistoryPoint>> }>
  >({
    data: {},
    loading: true,
    error: false
  })
  const [timespan, setTimespan] = useState<TimespanValue>(
    defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex]
  )

  useEffect(() => {
    const { start = null, end = null } = timespan?.range ?? {}
    if (!start || !end) return

    setTransactionsHistory(state => ({ ...state, loading: true }))

    Api.getTransactionsHistory(start, end, timespan?.intervalsCount)
      .then(res => fetchHandlerSuccess(setTransactionsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setTransactionsHistory, err))
  }, [timespan])

  return (
    <LineChartBlock
      title={title}
      useInfoBlock={useInfoBlock}
      menuIsActive={menuIsActive}
      loading={transactionsHistory.loading}
      error={transactionsHistory.error}
      timespanChange={setTimespan}
      data={
        transactionsHistory.data?.resultSet?.map(item => ({
          x: new Date(item.timestamp ?? 0),
          y: item.data?.txs ?? 0
        })) ?? []
      }
      xAxis={{
        type: (() => {
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 7)
            return { axis: 'date' as const }
          if (getDaysBetweenDates(timespan.range.start, timespan.range.end) > 3)
            return { axis: 'date' as const, tooltip: 'datetime' as const }
          return { axis: 'time' as const }
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
      type={type}
    />
  )
}
