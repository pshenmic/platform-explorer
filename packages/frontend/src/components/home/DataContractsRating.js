'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../util/Api'
import { Identifier, BigNumber } from '../data'
import { DataList } from '../ui/lists'
import RankMark, { placeOf, rankRowClassName } from './RankMark'
import { HOME_RICH_LIST_LIMIT } from './listLimits'

// contracts by transitions; API may return fewer than HOME_RICH_LIST_LIMIT
export default function DataContractsRating ({ enabled = true }) {
  const [state, setState] = useState({ loading: true, error: false, items: [] })

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: true, error: false }))
      return
    }
    setState(s => ({ ...s, loading: true, error: false }))
    Api.getDataContractsRating(1, HOME_RICH_LIST_LIMIT, 'desc')
      .then(res => setState({
        loading: false,
        error: false,
        items: (res?.resultSet ?? []).slice(0, HOME_RICH_LIST_LIMIT)
      }))
      .catch(() => setState({ loading: false, error: true, items: [] }))
  }, [enabled])

  const { loading, error, items } = state
  const rows = error ? [] : items

  const columns = [
    {
      key: 'contract',
      header: 'Contract',
      grow: true,
      minWidth: 120,
      cell: (item, i) => (
        <span className={'DataList__Entity'}>
          <RankMark place={placeOf(i)}/>
          <Identifier
            ellipsis={true}
            avatar={true}
            styles={['highlight-both']}
          >
            {item.identifier}
          </Identifier>
        </span>
      )
    },
    {
      key: 'transitions',
      header: 'Transitions',
      minWidth: 88,
      align: 'right',
      cell: (item) => <BigNumber>{item.transitionsCount}</BigNumber>
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
      rowHref={(item) => `/dataContract/${item.identifier}`}
      rowKey={(item) => item.identifier}
      rowClassName={rankRowClassName}
      footer={
        <Link href={'/dataContracts'} prefetch={false} className={'DataList__ShowMore'}>
          View all data contracts
        </Link>
      }
    />
  )
}
