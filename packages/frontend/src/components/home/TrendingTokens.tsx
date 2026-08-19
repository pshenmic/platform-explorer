'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../util/Api'
import { getTokenName } from '../../util'
import { Identifier, Alias, BigNumber } from '../data'
import { DataList } from '../ui/lists'
import RankMark, { placeOf, rankRowClassName } from './RankMark'
import { HOME_RICH_LIST_LIMIT } from './listLimits'

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000

// tokens by transitions over the last 30 days
export default function TrendingTokens ({ enabled = true }: { enabled?: boolean }) {
  const [state, setState] = useState<{ loading: boolean, error: boolean, items: any[] }>({ loading: true, error: false, items: [] })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    const end = new Date()
    const start = new Date(end.getTime() - WINDOW_MS)
    // over-fetch then dedupe: rating API can repeat tokenIdentifier
    Api.getTokensRating(1, HOME_RICH_LIST_LIMIT * 2, 'desc', {
      timestamp_start: start.toISOString(),
      timestamp_end: end.toISOString()
    })
      .then(res => {
        const raw = res?.resultSet ?? []
        const seen = new Set()
        const unique: any[] = []
        for (const item of raw) {
          const id = (item as any)?.tokenIdentifier || (item as any)?.identifier
          if (!id || seen.has(id)) continue
          seen.add(id)
          unique.push(item)
          if (unique.length >= HOME_RICH_LIST_LIMIT) break
        }
        setState({ loading: false, error: false, items: unique })
      })
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled])

  const { loading, error, items } = state
  const rows = error ? [] : items

  const columns = [
    {
      key: 'token',
      header: 'Token',
      grow: true,
      minWidth: 120,
      cell: (item: any, i: any) => {
        const name = getTokenName(item.localizations)
        return (
          <span className={'DataList__Entity'}>
            <RankMark place={placeOf(i)}/>
            {name
              ? <Alias avatarSource={item.tokenIdentifier}>{name}</Alias>
              : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{item.tokenIdentifier}</Identifier>}
          </span>
        )
      }
    },
    {
      key: 'transitions',
      header: 'Transitions',
      minWidth: 88,
      align: 'right',
      cell: (item: any) => <BigNumber>{item.transitionCount}</BigNumber>
    }
  ]

  return (
    <DataList
      className={'HomeRichestList'}
      items={rows}
      columns={columns}
      loading={loading}
      skeletonCount={HOME_RICH_LIST_LIMIT}
      emptyMessage={'No data'}
      rowHref={(item: any) => `/token/${item.tokenIdentifier}`}
      rowKey={(item: any, i?: number) => `${item.tokenIdentifier}-${i}`}
      rowClassName={rankRowClassName}
      footer={
        <Link href={'/tokens'} prefetch={false} className={'DataList__ShowMore'}>
          View all tokens
        </Link>
      }
    />
  )
}
