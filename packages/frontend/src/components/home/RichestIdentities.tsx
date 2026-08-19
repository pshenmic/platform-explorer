'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../util/Api'
import { Identifier, BigNumber } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import { DataList } from '../ui/lists'
import RankMark, { placeOf, rankRowClassName } from './RankMark'
import { HOME_RICH_LIST_LIMIT } from './listLimits'

const DEFAULT_SORT = { order_by: 'balance', order: 'desc' }

// identities by balance or tx_count (server sort via column headers)
export default function RichestIdentities({
  rate,
  enabled = true
}: {
  rate?: any
  enabled?: boolean
}) {
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [state, setState] = useState<{ loading: boolean; error: boolean; items: any[] }>({
    loading: true,
    error: false,
    items: []
  })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    Api.getIdentities(1, HOME_RICH_LIST_LIMIT, sort.order as any, sort.order_by)
      .then(res => {
        let items = (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)
        // re-sort by live balance (API ranks by transfer-sum)
        if (sort.order_by === 'balance') {
          const dir = sort.order === 'asc' ? 1 : -1
          items = [...items].sort(
            (a, b) => dir * ((Number(a.balance) || 0) - (Number(b.balance) || 0))
          )
        }
        setState({ loading: false, error: false, items })
      })
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled, sort.order, sort.order_by])

  const { loading, error, items } = state
  const rows = error ? [] : items
  const showRank =
    sort.order === 'desc' && (sort.order_by === 'balance' || sort.order_by === 'tx_count')

  const columns = [
    {
      key: 'identity',
      header: 'Identity',
      grow: true,
      minWidth: 100,
      cell: (item: any, i: any) => (
        <span className={'DataList__Entity'}>
          {showRank ? <RankMark place={placeOf(i)} /> : null}
          <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
            {item.identifier}
          </Identifier>
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      minWidth: 104,
      align: 'right',
      sortKey: 'balance',
      cell: (item: any) => {
        const credits = Number(item.balance)
        return (
          <RateTooltip credits={credits} rate={rate?.data}>
            <span>
              <BigNumber>{item.balance}</BigNumber>
            </span>
          </RateTooltip>
        )
      }
    },
    {
      key: 'txs',
      header: 'Txs',
      minWidth: 72,
      align: 'right',
      sortKey: 'tx_count',
      priority: 1,
      cell: (item: any) =>
        typeof item.totalTxs === 'number' ? <BigNumber>{item.totalTxs}</BigNumber> : '—'
    }
  ]

  return (
    <DataList
      className={'HomeRichestList HomeRichestList--Identities'}
      items={rows}
      columns={columns}
      loading={loading}
      skeletonCount={HOME_RICH_LIST_LIMIT}
      emptyMessage={'No data'}
      sort={sort}
      onSortChange={setSort}
      rowHref={(item: any) => `/identity/${item.identifier}`}
      rowKey={(item: any) => item.identifier}
      rowClassName={showRank ? rankRowClassName : undefined}
      footer={
        <Link href={'/identities'} prefetch={false} className={'DataList__ShowMore'}>
          View all identities
        </Link>
      }
    />
  )
}
