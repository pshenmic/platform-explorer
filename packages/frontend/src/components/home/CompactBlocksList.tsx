'use client'

import { BigNumber, TimeDelta, NotActive, Identifier } from '../data'
import { BlockIcon } from '../ui/icons'
import { DataList } from '../ui/lists'
import { useLiveList } from './hooks'
import { HOME_FEED_LIMIT } from './listLimits'
import './CompactBlocksList.css'

export function CompactBlocksList({
  blocks,
  limit = HOME_FEED_LIMIT,
  loading
}: {
  blocks?: any[]
  limit?: number
  loading?: boolean
}) {
  const { shown, newKeys, hoverBind } = useLiveList<any>(blocks, (b: any) => b?.header?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  const columns = [
    {
      key: 'height',
      header: 'Height',
      minWidth: 88,
      cell: (block: any) => {
        const height = block?.header?.height
        return (
          <span className={'CompactBlocksList__Height'}>
            <BlockIcon w={'1.125rem'} h={'1.125rem'} flexShrink={0} />
            {typeof height === 'number' ? <BigNumber>{height}</BigNumber> : <NotActive />}
          </span>
        )
      }
    },
    {
      key: 'hash',
      header: 'Hash',
      grow: true,
      minWidth: 96,
      cell: (block: any) =>
        block?.header?.hash ? (
          <Identifier ellipsis={true} styles={['highlight-both']}>
            {block.header.hash}
          </Identifier>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'txs',
      header: 'Txs',
      minWidth: 56,
      align: 'center',
      cell: (block: any) => {
        const txCount = Array.isArray(block?.txs) ? block.txs.length : 0
        return <span className={'CompactBlocksList__Txs'}>{txCount}</span>
      }
    },
    {
      key: 'time',
      header: 'Time',
      minWidth: 48,
      align: 'right',
      cell: (block: any) =>
        block?.header?.timestamp ? (
          <TimeDelta
            showTimestampTooltip={true}
            format={'compact'}
            endDate={new Date(block.header.timestamp)}
          />
        ) : (
          <NotActive />
        )
    }
  ]

  return (
    <DataList
      className={'CompactBlocksList'}
      items={rows}
      columns={columns}
      loading={loading && !rows.length}
      skeletonCount={limit}
      emptyMessage={'No blocks'}
      rowHref={(block: any) => `/block/${block?.header?.hash}`}
      rowKey={(block: any) => block?.header?.hash}
      rowClassName={(block: any) => (newKeys.has(block?.header?.hash) ? 'is-new' : '')}
      rowStyle={(block: any, i: number) =>
        newKeys.has(block?.header?.hash) ? { '--stagger': `${i * 50}ms` } : undefined
      }
      wrapperProps={hoverBind}
    />
  )
}
