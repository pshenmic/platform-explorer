'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Box } from '@chakra-ui/react'
import * as Api from '../../util/Api'
import { CardHead } from '../cards'
import { Skeleton } from './Skeleton'
import { compact } from './utils'
import './DataContractsRating.scss'

const LIMIT = 10

// top data contracts by state transitions count — a static leaderboard, no time-range presets
export default function DataContractsRating ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    Api.getDataContractsRating(1, LIMIT, 'desc')
      .then(res => setState({ loading: false, error: false, items: res?.resultSet ?? [] }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled])

  const { loading, error, items } = state
  const maxCount = items.reduce((max, i) => Math.max(max, i.transitionsCount || 0), 0) || 1

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder DataContractsRating'} w={'100%'}>
      <CardHead title={'Data contracts rating'}/>

      <div className={'DataContractsRating__Body'}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className={'DataContractsRating__Row DataContractsRating__Row--skeleton'} key={i}>
                <Skeleton w={'1.5rem'} h={'0.8em'}/>
                <Skeleton w={'50%'} h={'0.8em'}/>
                <Skeleton w={'40px'} h={'0.8em'}/>
              </div>
          ))
          : error || !items.length
            ? <div className={'DataContractsRating__Empty'}>No data</div>
            : items.map((item, i) => (
              <Link
                key={item.identifier}
                href={`/dataContract/${item.identifier}`}
                prefetch={false}
                className={'DataContractsRating__Row'}
              >
                <span className={'DataContractsRating__Rank'}>{i + 1}</span>
                <span className={'DataContractsRating__Identifier'}>{item.identifier}</span>
                <span className={'DataContractsRating__BarTrack'}>
                  <span
                    className={'DataContractsRating__Bar'}
                    style={{ width: `${Math.max(4, ((item.transitionsCount || 0) / maxCount) * 100)}%` }}
                  />
                </span>
                <span className={'DataContractsRating__Count'}>{compact(item.transitionsCount || 0)}</span>
              </Link>
            ))}
      </div>
    </Box>
  )
}
