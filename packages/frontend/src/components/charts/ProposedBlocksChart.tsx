'use client'

import type { LoadableState } from '../../types/common'
import type { SeriesData } from '../../types'
import type { TimespanValue } from './types'
import LineChartBlock from './LineChartBlock'

interface BlocksHistoryPoint {
  blocksCount?: number
}

interface ProposedBlocksChartProps {
  blocksHistory: LoadableState<{ resultSet?: Array<SeriesData<BlocksHistoryPoint>> }>
  timespan?: TimespanValue | string
  timespanChangeHandler?: (value: TimespanValue) => void
  blockBorders?: boolean
  height?: string | number
}

export default function ProposedBlocksChart({
  blocksHistory,
  timespan,
  timespanChangeHandler,
  blockBorders = true,
  height = '220px'
}: ProposedBlocksChartProps) {
  if (!timespanChangeHandler) timespanChangeHandler = () => {}

  const timespanKey = typeof timespan === 'string' ? timespan : timespan?.label

  return (
    <LineChartBlock
      title={'Proposed blocks'}
      loading={blocksHistory.loading}
      error={blocksHistory.error}
      timespanChange={timespanChangeHandler}
      data={
        blocksHistory.data?.resultSet?.map(item => ({
          x: new Date(item.timestamp ?? 0),
          y: item.data?.blocksCount ?? 0
        })) || []
      }
      xAxis={{
        type: (() => {
          if (timespanKey === '1h') return { axis: 'time' as const }
          if (timespanKey === '24h' || timespanKey === '24 hours') return { axis: 'time' as const }
          if (timespanKey === '3d' || timespanKey === '3 days')
            return { axis: 'date' as const, tooltip: 'datetime' as const }
          if (timespanKey === '1w' || timespanKey === '1 week') return { axis: 'date' as const }
          return { axis: 'date' as const }
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
