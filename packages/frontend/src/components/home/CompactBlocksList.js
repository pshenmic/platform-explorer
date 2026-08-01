'use client'

import Link from 'next/link'
import { BigNumber, TimeDelta, NotActive, Identifier } from '../data'
import { BlockIcon } from '../ui/icons'
import { DataList } from '../ui/lists'
import { useLiveList } from './hooks'
import { HOME_FEED_LIMIT } from './listLimits'
import './CompactBlocksList.scss'

export function CompactBlocksList ({
  blocks,
  limit = HOME_FEED_LIMIT,
  loading,
  moreHref,
  moreLabel
}) {
  const { shown, newKeys, hoverBind } = useLiveList(blocks, b => b?.header?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  const columns = [
    {
      key: 'height',
      header: 'Height',
      minWidth: 88,
      cell: (block) => {
        const height = block?.header?.height
        return (
          <>
            <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.35rem'} flexShrink={0}/>
            {typeof height === 'number' ? <BigNumber>{height}</BigNumber> : <NotActive/>}
          </>
        )
      }
    },
    {
      key: 'hash',
      header: 'Hash',
      grow: true,
      minWidth: 96,
      cell: (block) => (block?.header?.hash
        ? <Identifier ellipsis={true} styles={['highlight-both']}>{block.header.hash}</Identifier>
        : <NotActive/>)
    },
    {
      key: 'txs',
      header: 'Txs',
      minWidth: 56,
      align: 'center',
      cell: (block) => {
        const txCount = Array.isArray(block?.txs) ? block.txs.length : 0
        return <span className={'CompactBlocksList__Txs'}>{txCount}</span>
      }
    },
    {
      key: 'time',
      header: 'Time',
      minWidth: 48,
      align: 'right',
      cell: (block) => (block?.header?.timestamp
        ? <TimeDelta showTimestampTooltip={true} format={'compact'} endDate={new Date(block.header.timestamp)}/>
        : <NotActive/>)
    }
  ]

  const footer = moreHref
    ? <Link href={moreHref} prefetch={false} className={'DataList__ShowMore'}>{moreLabel || 'View all'}</Link>
    : null

  return (
    <DataList
      className={'CompactBlocksList'}
      items={rows}
      columns={columns}
      loading={loading && !rows.length}
      skeletonCount={limit}
      emptyMessage={'No blocks'}
      rowHref={(block) => `/block/${block?.header?.hash}`}
      rowKey={(block) => block?.header?.hash}
      rowClassName={(block) => (newKeys.has(block?.header?.hash) ? 'is-new' : '')}
      rowStyle={(block, i) => (newKeys.has(block?.header?.hash) ? { '--stagger': `${i * 50}ms` } : undefined)}
      wrapperProps={hoverBind}
      footer={footer}
    />
  )
}
