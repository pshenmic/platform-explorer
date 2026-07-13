'use client'

import Link from 'next/link'
import { BigNumber, TimeDelta, NotActive, Identifier } from '../data'
import { Skeleton } from './Skeleton'
import { useLiveList } from './hooks'
import './CompactBlocksList.scss'

// dense latest-blocks list; refreshes are held back while hovered
export function CompactBlocksList ({ blocks, limit = 7, loading }) {
  const { shown, newKeys, hoverBind } = useLiveList(blocks, b => b?.header?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  // skeleton mirrors the real row grid so there's no layout shift
  if (loading && !rows.length) {
    return (
      <div className={'CompactBlocks'}>
        {Array.from({ length: limit }).map((_, i) => (
          <div className={'CompactBlocks__Row CompactBlocks__Row--skeleton'} key={i}>
            <span className={'CompactBlocks__Height'}><Skeleton w={'58px'} h={'0.8em'}/></span>
            <span className={'CompactBlocks__HashCell'}><Skeleton w={'72%'} h={'0.8em'}/></span>
            <span className={'CompactBlocks__Txs'}><Skeleton w={'40px'} h={'1.05em'} radius={4}/></span>
            <span className={'CompactBlocks__Time'}><Skeleton w={'42px'} h={'0.7em'}/></span>
          </div>
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return <div className={'CompactBlocks__Empty'}>No blocks</div>
  }

  return (
    <div className={'CompactBlocks'} {...hoverBind}>
      {rows.map((block, i) => {
        const header = block?.header
        const txCount = Array.isArray(block?.txs) ? block.txs.length : 0
        return (
          <Link
            key={header?.hash}
            href={`/block/${header?.hash}`}
            className={`CompactBlocks__Row${newKeys.has(header?.hash) ? ' is-new' : ''}`}
            // fresh rows cascade in top-down instead of swapping in one frame
            style={newKeys.has(header?.hash) ? { '--stagger': `${i * 50}ms` } : undefined}
          >
            <span className={'CompactBlocks__Height'}>
              {typeof header?.height === 'number' ? <><span className={'CompactBlocks__Hatch'}>#</span><BigNumber>{header.height}</BigNumber></> : <NotActive/>}
            </span>

            <span className={'CompactBlocks__HashCell'}>
              {header?.hash ? <Identifier middleEllipsis={true}>{header.hash}</Identifier> : <NotActive/>}
            </span>

            <span className={'CompactBlocks__Txs'}>{txCount} {txCount === 1 ? 'tx' : 'txs'}</span>

            <span className={'CompactBlocks__Time'}>
              {header?.timestamp ? <TimeDelta showTimestampTooltip={true} endDate={new Date(header.timestamp)}/> : <NotActive/>}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
