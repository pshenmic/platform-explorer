'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LineChart, TimeframeSelector } from './index'
import { Container, Heading, Flex } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
import './ChartBlock.css'
import useResizeObserver from '@react-hook/resize-observer'
import { defaultChartConfig } from './config'
import type {
  ChartAxis,
  ChartConfig,
  ChartDataPoint,
  ChartRenderType,
  TimespanValue
} from './types'
import type { WithClassName } from '../../types/common'

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

interface LineChartBlockProps extends WithClassName {
  heightPx?: number
  menuIsActive?: boolean
  data?: ChartDataPoint[]
  xAxis?: ChartAxis
  yAxis?: ChartAxis
  loading?: boolean
  error?: boolean
  timespanChange?: (value: TimespanValue) => void
  title?: ReactNode
  config?: ChartConfig
  blockBorders?: boolean
  useInfoBlock?: boolean
  type?: ChartRenderType
  /** Accepted for callers that pass CSS height; preferred prop is heightPx. */
  height?: string | number
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
  className,
  type = 'line',
  height
}: LineChartBlockProps) {
  const resolvedHeightPx = typeof height === 'number'
    ? height
    : (typeof height === 'string' && height.endsWith('px')
        ? parseInt(height, 10) || heightPx
        : heightPx)

  const chartConfig = config || defaultChartConfig
  const [timespan, setTimespan] = useState<TimespanValue | undefined>(chartConfig.timespan.default)

  function timespanChangeHandler (value: TimespanValue) {
    setTimespan(value)
    if (typeof timespanChange === 'function') timespanChange(value)
  }

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const TimeframeMenuRef = useRef<HTMLDivElement>(null)
  const [selectorHeight, setSelectorHeight] = useState(0)

  const updateMenuHeight = () => {
    if (menuIsOpen && TimeframeMenuRef?.current) {
      const element = TimeframeMenuRef.current
      const h = element.getBoundingClientRect().height
      setSelectorHeight(h)
    } else {
      setSelectorHeight(0)
    }
  }

  useEffect(updateMenuHeight, [menuIsOpen, TimeframeMenuRef])

  useResizeObserver(TimeframeMenuRef as never, updateMenuHeight)

  return (<>
    <Flex
        className={`ChartBlock ${useInfoBlock ? `InfoBlock ${!blockBorders ? 'InfoBlock--NoBorder' : ''}` : ''} ${menuIsOpen ? 'ChartBlock--MenuIsOpen' : ''} ${className ?? ''}`}
        maxW={'none'}
        width={'100%'}
        borderWidth={useInfoBlock ? '1px' : '0'}
        borderRadius={useInfoBlock ? 'block' : 'none'}
        direction={'column'}
        style={{
          height: menuIsOpen ? `${Math.max(selectorHeight, resolvedHeightPx)}px` : `${resolvedHeightPx}px`,
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
                  type={type}
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
