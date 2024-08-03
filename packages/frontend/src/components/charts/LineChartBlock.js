'use client'

import { useState } from 'react'
import { LineChart } from '../../components/charts/index.js'
import { Container, Heading, Flex } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'

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

export default function LineChartBlock ({ height = '220px', items, data, xAxis, yAxis, loading, error, timespanChange, title, config }) {
  const chartConfig = config || defChartConfig
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)

  function timespanChangeHandler (value) {
    setTimespan(value)
    if (typeof timespanChange === 'function') timespanChange(value)
  }

  return (<>
    <Flex
        className={'ChartBlock'}
        maxW={'none'}
        width={'100%'}
        borderWidth={'1px'} borderRadius={'lg'}
        direction={'column'}
        p={3}
        pb={2}
        background={'gray.900'}
        height={height}
    >
        <div className={'ChartBlock__Head'}>
            <Heading className={'ChartBlock__Title'} as={'h2'} size={'sm'}>{title}</Heading>

            <div className={'ChartBlock__TimeframeContainer'}>
                <span>Timeframe: </span>
                <select
                    className={'ChartBlock__TimeframeSelector'}
                    onChange={(e) => timespanChangeHandler(e.target.value)}
                    defaultValue={chartConfig.timespan.default}
                >
                    {chartConfig.timespan.values.map(timespan => {
                      return <option value={timespan} key={'ts' + timespan}>{timespan}</option>
                    })}
                </select>
            </div>
        </div>

        <Flex
            minH={'220px'}
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
