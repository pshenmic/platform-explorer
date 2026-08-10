'use client'

import type { ComponentType, CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import {
  BigNumber as BigNumberJs,
  TimeDelta as TimeDeltaJs,
  NotActive as NotActiveJs
} from '../data'
import { BlockIcon } from '../ui/icons'
import { Skeleton } from './Skeleton'
import { useLiveList } from './hooks'
import type { Block } from '../../types'
import './CompactBlocksList.scss'

// Untyped JS components — loose wrappers until data/* is migrated
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode, className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: Date
  showTimestampTooltip?: boolean
  format?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>

// column-title row, same grid as the data rows, so the list reads like the full tables
function CompactBlocksHead () {
  return (
    <div className={'CompactBlocks__Head'} aria-hidden={'true'}>
      <span className={'CompactBlocks__HeadCell'}>Height</span>
      <span className={'CompactBlocks__HeadCell'}>Hash</span>
      <span className={'CompactBlocks__HeadCell CompactBlocks__HeadCell--txs'}>Txs</span>
      <span className={'CompactBlocks__HeadCell CompactBlocks__HeadCell--time'}>Time</span>
    </div>
  )
}

interface CompactBlocksListProps {
  blocks?: Block[] | null
  limit?: number
  loading?: boolean
  moreHref?: string
  moreLabel?: string
}

// dense latest-blocks list; refreshes are held back while hovered
export function CompactBlocksList ({
  blocks,
  limit = 6,
  loading,
  moreHref,
  moreLabel
}: CompactBlocksListProps) {
  const { shown, newKeys, hoverBind } = useLiveList(blocks, b => b?.header?.hash ?? '')
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  const footer = moreHref
    ? <Link href={moreHref} prefetch={false} className={'CompactBlocks__More'}>{moreLabel || 'View all'}</Link>
    : null

  // skeleton mirrors the real row grid so there's no layout shift
  if (loading && !rows.length) {
    return (
      <div className={'CompactBlocks'}>
        <CompactBlocksHead/>
        {Array.from({ length: limit }).map((_, i) => (
          <div className={'CompactBlocks__Row CompactBlocks__Row--skeleton'} key={i}>
            <span className={'CompactBlocks__Height'}>
              <Skeleton w={'1rem'} h={'1rem'} radius={4}/>
              <Skeleton w={'46px'} h={'0.8em'}/>
            </span>
            <span className={'CompactBlocks__HashCell'}><Skeleton w={'72%'} h={'0.8em'}/></span>
            <span className={'CompactBlocks__Txs'}><Skeleton w={'40px'} h={'1.05em'} radius={4}/></span>
            <span className={'CompactBlocks__Time'}><Skeleton w={'42px'} h={'0.7em'}/></span>
          </div>
        ))}
        {footer}
      </div>
    )
  }

  if (!rows.length) {
    return <div className={'CompactBlocks__Empty'}>No blocks</div>
  }

  return (
    <div className={'CompactBlocks'} {...hoverBind}>
      <CompactBlocksHead/>
      {rows.map((block, i) => {
        const header = block?.header
        const txCount = Array.isArray(block?.txs) ? block.txs.length : 0
        const hash = header?.hash
        const isNew = hash ? newKeys.has(hash) : false
        const style = isNew
          ? ({ '--stagger': `${i * 50}ms` } as CSSProperties)
          : undefined
        return (
          <Link
            key={hash}
            href={`/block/${hash}`}
            // rows churn every refresh tick; prefetching each new hash grows the router cache for the tab's lifetime
            prefetch={false}
            className={`CompactBlocks__Row${isNew ? ' is-new' : ''}`}
            // fresh rows cascade in top-down instead of swapping in one frame
            style={style}
          >
            <span className={'CompactBlocks__Height'}>
              <BlockIcon className={'CompactBlocks__Icon'} w={'1rem'} h={'1rem'}/>
              {typeof header?.height === 'number' ? <BigNumber>{header.height}</BigNumber> : <NotActive/>}
            </span>

            <span className={'CompactBlocks__HashCell'}>
              {hash ? <span className={'CompactBlocks__HashText'}>{hash}</span> : <NotActive/>}
            </span>

            <span className={'CompactBlocks__Txs'}>{txCount} {txCount === 1 ? 'tx' : 'txs'}</span>

            <span className={'CompactBlocks__Time'}>
              {header?.timestamp ? <TimeDelta showTimestampTooltip={true} format={'compact'} endDate={new Date(header.timestamp)}/> : <NotActive/>}
            </span>
          </Link>
        )
      })}
      {footer}
    </div>
  )
}
