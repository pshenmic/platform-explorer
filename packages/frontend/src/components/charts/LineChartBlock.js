'use client'

import { useState } from 'react'
import { LineChart } from '../../components/charts/index.js'
import { Container, Heading, Flex, Button } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
import './ChartBlock.scss'

function ErrorMessageBlock () {
  return (
    <Flex
      flexGrow={1}
      w={'100%'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      opacity={0.5}
    >
      <div><WarningTwoIcon color={'#ddd'} mr={2} mt={-1}/>Error loading data</div>
    </Flex>
  )
}

const defChartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

export default function LineChartBlock ({
  height = '220px',
  data,
  xAxis,
  yAxis,
  loading,
  error,
  timespanChange,
  title,
  config,
  blockBorders = true
}) {
  const chartConfig = config || defChartConfig
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)

  function timespanChangeHandler (value) {
    setTimespan(value)
    if (typeof timespanChange === 'function') timespanChange(value)
  }

  return (<>
    <Flex
        className={`ChartBlock InfoBlock ${!blockBorders ? 'InfoBlock--NoBorder' : ''}`}
        maxW={'none'}
        width={'100%'}
        borderWidth={'1px'} borderRadius={'block'}
        direction={'column'}
        pb={'10px !important'}
        height={height}
    >
      <Heading className={'InfoBlock__Title'} as={'h1'}>{title}</Heading>

      <div className={'ChartBlock__TimeframeContainer'}>
        <span className={'ChartBlock__TimeframeTitle'}>Timeframe:</span>
        <div className={'ChartBlock__TimeframeButtons'}>
          {chartConfig.timespan.values.map(iTimespan => {
            return (
              <Button
                className={`ChartBlock__TimeframeButton ${timespan === iTimespan ? 'ChartBlock__TimeframeButton--Active' : ''}`}
                onClick={() => timespanChangeHandler(iTimespan)}
                key={'ts' + iTimespan}>{iTimespan}</Button>
            )
          })}
        </div>
      </div>

        <Flex
            height={height}
            maxW={'none'}
            flexGrow={'1'}
            mt={2}
            mb={4}
            p={0}
            flexDirection={'column'}
        >
          {!loading
            ? (!error && data?.length)
                ? <LineChart
                    data={data}
                    timespan={timespan}
                    xAxis={xAxis}
                    yAxis={yAxis}
                />
                : <ErrorMessageBlock/>
            : <Container
                w={'100%'}
                h={'100%'}
                className={'ChartBlock__Loader'}>
              </Container>}
        </Flex>
    </Flex>
  </>)
}
