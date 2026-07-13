'use client'

import { useState, useEffect } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { Skeleton } from './Skeleton'
import { compact } from './utils'
import './TxTypesDonut.scss'

const SIZE = 200
const STROKE = 16
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R
const TOP_TYPES = 4
const SEGMENT_CLASSES = ['a', 'b', 'c', 'd', 'other']

function labelOf (type) {
  return TransactionTypesInfo[type]?.title ?? type
}

// all-time transaction count split by state transition type (top types + everything else)
export default function TxTypesDonut () {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

  useEffect(() => {
    Api.getTransactionsStatistic()
      .then(res => setState({ loading: false, error: false, items: Array.isArray(res) ? res : [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [])

  const sorted = [...state.items].sort((a, b) => (b.count || 0) - (a.count || 0))
  const top = sorted.slice(0, TOP_TYPES)
  const restCount = sorted.slice(TOP_TYPES).reduce((sum, t) => sum + (t.count || 0), 0)
  const segments = [
    ...top.map(t => ({ label: labelOf(t.transactionType), count: t.count || 0 })),
    ...(restCount > 0 ? [{ label: 'Other', count: restCount }] : [])
  ]
  const total = segments.reduce((sum, s) => sum + s.count, 0)

  // each segment is one circle stroke: dasharray carves its share, dashoffset rotates it in place
  let acc = 0
  const arcs = segments.map((s, i) => {
    const frac = total > 0 ? s.count / total : 0
    const arc = { ...s, frac, offset: acc, cls: SEGMENT_CLASSES[i] ?? 'other' }
    acc += frac
    return arc
  })

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder TxTypesDonut'} w={'100%'}>
      <Heading className={'InfoBlock__Title'} as={'h2'}>Transaction types</Heading>

      <div className={'TxTypesDonut__Body'}>
        {state.loading
          ? <div className={'TxTypesDonut__Row'}>
              <Skeleton w={'132px'} circle/>
              <div className={'TxTypesDonut__Legend'}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton w={'120px'} h={'0.75em'} key={i}/>)}
              </div>
            </div>
          : state.error || !total
            ? <div className={'TxTypesDonut__Empty'}>No data</div>
            : <div className={'TxTypesDonut__Row'}>
                <svg
                  className={'TxTypesDonut__Svg'}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  role={'img'}
                  aria-label={`${total} transactions by type`}
                >
                  {arcs.map(a => (
                    <circle
                      key={a.label}
                      className={`TxTypesDonut__Arc TxTypesDonut__Arc--${a.cls}`}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={R}
                      fill={'none'}
                      strokeWidth={STROKE}
                      strokeDasharray={`${Math.max(a.frac * C - 2, 0)} ${C}`}
                      strokeDashoffset={-a.offset * C}
                      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    />
                  ))}
                  <text className={'TxTypesDonut__Total'} x={'50%'} y={'45%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={34}>{compact(total)}</text>
                  <text className={'TxTypesDonut__TotalLabel'} x={'50%'} y={'62%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={12}>transactions</text>
                </svg>

                <div className={'TxTypesDonut__Legend'}>
                  {arcs.map(a => (
                    <span className={'TxTypesDonut__LegendItem'} key={a.label}>
                      <i className={`TxTypesDonut__Dot TxTypesDonut__Dot--${a.cls}`}/>
                      <span className={'TxTypesDonut__LegendLabel'}>{a.label}</span>
                      <span className={'TxTypesDonut__LegendCount'}>{compact(a.count)}</span>
                    </span>
                  ))}
                </div>
              </div>}
      </div>
    </Box>
  )
}
