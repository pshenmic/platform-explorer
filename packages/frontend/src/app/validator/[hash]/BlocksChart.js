import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { useState, useEffect } from 'react'
import { LineChart } from './../../../components/charts'
import * as Api from '../../../util/Api'
import { Button } from '@chakra-ui/react'
import { CalendarIcon } from './../../../components/ui/icons'
import './TimeframeSelector.scss'

const chartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

const TimeframeSelector = ({ config, callback }) => {
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)
  const [menuIsActive, setMenuIsActive] = useState(false)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof callback === 'function') callback(value)
  }

  return (
    <div className={`TimeframeSelector ${menuIsActive ? 'TimeframeSelector--MenuActive' : ''}`}>
      <div className={'TimeframeSelector__Menu'}>
        <div className={'TimeframeSelector__Values'}>
          {config.timespan.values.map(iTimespan => (
            <Button
              className={`ChartBlock__TimeframeButton ${timespan === iTimespan ? 'ChartBlock__TimeframeButton--Active' : ''}`}
              onClick={() => {
                changeHandler(iTimespan)
                setMenuIsActive(false)
              }}
              key={iTimespan}
            >
              {iTimespan}
            </Button>
          ))}
        </div>
      </div>
        <Button
          className={'TimeframeSelector__Button'}
          onClick={() => setMenuIsActive(state => !state)}
        >
          <CalendarIcon mr={'10px'}/>
          {timespan}
        </Button>
    </div>
  )
}

export default function BlocksChart ({ hash }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)

  useEffect(() => {
    Api.getBlocksStatsByValidator(hash, timespan)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan])

  return (
    <div style={{ height: '100%' }}>
      <TimeframeSelector config={chartConfig} callback={setTimespan}/>
      <LineChart
        data={blocksHistory.data?.resultSet?.map((item) => ({
          x: new Date(item.timestamp),
          y: item.data.blocksCount
        })) || []}
        timespan={timespan}
        xAxis={{
          type: (() => {
            if (timespan === '1h') return { axis: 'time' }
            if (timespan === '24h') return { axis: 'time' }
            if (timespan === '3d') return { axis: 'date', tooltip: 'datetime' }
            if (timespan === '1w') return { axis: 'date' }
          })()
        }}
        yAxis={{
          type: 'number',
          abbreviation: 'blocks'
        }}
      />
    </div>

  // <ProposedBlocksChart
  //   height={height}
  //   blocksHistory={blocksHistory}
  //   timespan={blocksHistoryTimespan}
  //   timespanChangeHandler={setBlocksHistoryTimespan}
  //   blockBorders={blockBorders}
  // />
  )
}
