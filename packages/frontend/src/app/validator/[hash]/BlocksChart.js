import { useState, useEffect, useRef } from 'react'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LineChart, TimeframeMenu } from './../../../components/charts'
import * as Api from '../../../util/Api'
import { Button } from '@chakra-ui/react'
import { CalendarIcon } from './../../../components/ui/icons'
import { ErrorMessageBlock } from '../../../components/Errors'
import './TimeframeSelector.scss'
import './TabsChart.scss'

const chartConfig = {
  timespan: {
    defaultIndex: 3,
    values: [
      {
        label: '1 hour',
        range: '1h'
      },
      {
        label: '24 hours',
        range: '24h'
      },
      {
        label: '3 days',
        range: '3d'
      },
      {
        label: '1 week',
        range: '1w'
      }
    ]
  }
}

const TimeframeSelector = ({ config, isActive, changeCallback, openStateCallback, menuRef }) => {
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
    setMenuIsOpen(false)
  }

  useEffect(() => {
    if (!isActive) setMenuIsOpen(false)
  }, [isActive])

  useEffect(() => {
    if (typeof openStateCallback === 'function') openStateCallback(menuIsOpen)
  }, [menuIsOpen])

  return (
    <div className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''}`}>
      <TimeframeMenu
        ref={menuRef}
        className={'TimeframeSelector__Menu'}
        config={config}
        changeCallback={changeHandler}
      />

      <Button
        className={`TimeframeSelector__Button ${menuIsOpen ? 'TimeframeSelector__Button--Active' : ''}`}
        onClick={() => setMenuIsOpen(state => !state)}
      >
        <CalendarIcon mr={'10px'}/>
        {timespan.label}
      </Button>
    </div>
  )
}

export default function BlocksChart ({ hash, isActive }) {
  const [blocksHistory, setBlocksHistory] = useState({ data: {}, loading: true, error: false })
  const [timespan, setTimespan] = useState(chartConfig.timespan.values[chartConfig.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  useEffect(() => {
    Api.getBlocksStatsByValidator(hash, timespan.range)
      .then(res => fetchHandlerSuccess(setBlocksHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setBlocksHistory, err))
  }, [timespan])

  useEffect(() => {
    if (menuIsOpen && TimeframeMenuRef.current) {
      const element = TimeframeMenuRef.current
      const height = element.getBoundingClientRect().height
      setSelectorHeight(height)
    } else {
      setSelectorHeight(0)
    }
  }, [menuIsOpen, TimeframeMenuRef])

  if (blocksHistory.error || (!blocksHistory.loading && !blocksHistory.data?.resultSet)) {
    return (<ErrorMessageBlock/>)
  }

  return (
    <div style={{ height: menuIsOpen ? `${Math.max(selectorHeight, 350)}px` : '350px' }} className={'TabsChart'}>
      {!blocksHistory.loading &&
        <TimeframeSelector
          menuRef={TimeframeMenuRef}
          className={'TabsChart__TimeframeSelector'}
          config={chartConfig}
          changeCallback={setTimespan}
          isActive={isActive}
          openStateCallback={setMenuIsOpen}
        />
      }
      <div className={`TabsChart__ChartContiner ${menuIsOpen ? 'TabsChart__ChartContiner--Hidden' : ''}`}>
        <LineChart
          data={blocksHistory.data?.resultSet?.map((item) => ({
            x: new Date(item.timestamp),
            y: item.data.blocksCount
          })) || []}
          timespan={timespan.range}
          xAxis={{
            type: (() => {
              if (timespan.range === '1h') return { axis: 'time' }
              if (timespan.range === '24h') return { axis: 'time' }
              if (timespan.range === '3d') return { axis: 'date', tooltip: 'datetime' }
              if (timespan.range === '1w') return { axis: 'date' }
            })()
          }}
          yAxis={{
            type: 'number',
            abbreviation: 'blocks'
          }}
        />
      </div>
    </div>
  )
}
