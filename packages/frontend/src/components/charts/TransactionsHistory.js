'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { LineChart } from '../../components/charts/index.js'
import {
  Container,
  Heading,
  Flex
} from '@chakra-ui/react'
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

const transactionsChartConfig = {
  timespan: {
    default: '1w',
    values: ['1h', '24h', '3d', '1w']
  }
}

export default function TransactionsHistory ({ height = '220px' }) {
  const [transactionsHistory, setTransactionsHistory] = useState({ data: {}, loading: true, error: false })
  const [transactionsTimespan, setTransactionsTimespan] = useState(transactionsChartConfig.timespan.default)

  function fetchHandlerSuccess (setter, data) {
    setter(state => ({
      ...state,
      data: {
        ...state.data,
        ...data
      },
      loading: false,
      error: false
    }))
  }

  function fetchHandlerError (setter, error) {
    console.error(error)

    setter(state => ({
      ...state,
      data: null,
      loading: false,
      error: true
    }))
  }

  useEffect(() => {
    Api.getTransactionsHistory(transactionsTimespan)
      .then(res => fetchHandlerSuccess(setTransactionsHistory, { resultSet: res }))
      .catch(err => fetchHandlerError(setTransactionsHistory, err))
  }, [transactionsTimespan])

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
    >
        <div className={'ChartBlock__Head'}>
            <Heading className={'ChartBlock__Title'} as={'h2'} size={'sm'}>Transactions history</Heading>

            <div className={'ChartBlock__TimeframeContainer'}>
                <span>Timeframe: </span>
                <select
                    className={'ChartBlock__TimeframeSelector'}
                    onChange={(e) => setTransactionsTimespan(e.target.value)}
                    defaultValue={transactionsChartConfig.timespan.default}
                >
                    {transactionsChartConfig.timespan.values.map(timespan => {
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
          {!transactionsHistory.loading
            ? (!transactionsHistory.error && transactionsHistory.data?.resultSet?.length)
                ? <LineChart
                    data={transactionsHistory.data.resultSet.map((item) => ({
                      x: new Date(item.timestamp),
                      y: item.data.txs
                    }))}
                    timespan={transactionsTimespan}
                    xAxis={{
                      type: (() => {
                        if (transactionsTimespan === '1h') return { axis: 'time' }
                        if (transactionsTimespan === '24h') return { axis: 'time' }
                        if (transactionsTimespan === '3d') return { axis: 'date', tooltip: 'datetime' }
                        if (transactionsTimespan === '1w') return { axis: 'date' }
                      })(),
                      abbreviation: '',
                      title: ''
                    }}
                    yAxis={{
                      type: 'number',
                      title: '',
                      abbreviation: 'txs'
                    }}
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
