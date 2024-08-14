import ProposedBlocksChart from './../../../components/charts/ProposedBlocksChart'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'

const chartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

export default function BlocksChart ({ hash }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [blocksHistoryTimespan, setBlocksHistoryTimespan] = useState(chartConfig.timespan.default)

  useEffect(() => {
    Api.getBlocksStatsByValidator(hash, blocksHistoryTimespan)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [blocksHistoryTimespan])

  return (
    <ProposedBlocksChart
      height={'100%'}
      blocksHistory={blocksHistory}
      timespan={blocksHistoryTimespan}
      timespanChangeHandler={setBlocksHistoryTimespan}
    />
  )
}
