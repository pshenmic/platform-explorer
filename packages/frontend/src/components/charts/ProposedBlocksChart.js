'use client'

import LineChartBlock from '../../components/charts/LineChartBlock'

export default function ProposedBlocksChart ({ blocksHistory, timespan, timespanChangeHandler, blockBorders = true, height = '220px' }) {
  if (!timespanChangeHandler) timespanChangeHandler = () => {}

  return (
    <LineChartBlock
        title={'Proposed blocks'}
        loading={blocksHistory.loading}
        error={blocksHistory.error}
        timespanChange={timespanChangeHandler}
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
        blockBorders={blockBorders}
    />
  )
}
