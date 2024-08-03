'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import LineChartBlock from '../../components/charts/LineChartBlock'

const chartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

export default function ProposedBlocksChart ({ proTxHash, height = '220px' }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)

  useEffect(() => {
    Api.getBlocksStatsByValidator(proTxHash, timespan)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan])

  return (
    <LineChartBlock
        title={'Proposed blocks'}
        loading={blocksHistory.loading}
        error={blocksHistory.error}
        timespanChange={setTimespan}
        data={blocksHistory.data?.resultSet?.map((item) => ({
          x: new Date(item.timestamp),
          y: item.data.blocksCount
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
          abbreviation: 'blocks'
        }}
        height={height}
    />
  )
}
