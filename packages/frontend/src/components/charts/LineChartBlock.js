'use client'

import { useEffect, useRef, useState } from 'react'
import { LineChart, TimeframeSelector } from '../../components/charts/index.js'
import { Container, Heading, Flex } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
import './ChartBlock.scss'
import useResizeObserver from '@react-hook/resize-observer'
import { defaultChartConfig } from './config'

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

export default function LineChartBlock ({
  heightPx = 300,
  menuIsActive = true,
  data,
  xAxis,
  yAxis,
  loading,
  error,
  timespanChange,
  title,
  config,
  blockBorders = true,
  useInfoBlock = true,
  className
}) {
  const chartConfig = config || defaultChartConfig
  const [timespan, setTimespan] = useState(chartConfig.timespan.default)

  function timespanChangeHandler (value) {
    setTimespan(value)
    if (typeof timespanChange === 'function') timespanChange(value)
  }

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  const updateMenuHeight = () => {
    if (menuIsOpen && TimeframeMenuRef?.current) {
      const element = TimeframeMenuRef.current
      const height = element.getBoundingClientRect().height
      setSelectorHeight(height)
    } else {
      setSelectorHeight(0)
    }
  }

  useEffect(updateMenuHeight, [menuIsOpen, TimeframeMenuRef])

  useResizeObserver(TimeframeMenuRef, updateMenuHeight)

  return (<>
    <Flex
        className={`ChartBlock ${useInfoBlock ? `InfoBlock ${!blockBorders ? 'InfoBlock--NoBorder' : ''}` : ''} ${menuIsOpen ? 'ChartBlock--MenuIsOpen' : ''} ${className ?? ''}`}
        maxW={'none'}
        width={'100%'}
        borderWidth={useInfoBlock ? '1px' : '0'}
        borderRadius={useInfoBlock ? 'block' : 'none'}
        direction={'column'}
        style={{
          height: menuIsOpen ? `${Math.max(selectorHeight, heightPx)}px` : `${heightPx}px`,
          minHeight: '100%'
        }}
    >
      {useInfoBlock &&
        <Heading className={'InfoBlock__Title'} as={'h1'}>{title}</Heading>
      }

      <TimeframeSelector
        menuRef={TimeframeMenuRef}
        className={'ChartBlock__TimeframeSelector'}
        config={chartConfig}
        changeCallback={timespanChangeHandler}
        menuIsActive={menuIsActive}
        openStateCallback={setMenuIsOpen}
      />

      <Flex
        className={`ChartBlock__ChartContainer ${menuIsOpen ? 'ChartBlock__ChartContainer--Hidden' : ''}`}
        height={'100%'}
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
              maxW={'none'}
              className={'ChartBlock__Loader'}>
            </Container>}
      </Flex>
    </Flex>
  </>)
}
