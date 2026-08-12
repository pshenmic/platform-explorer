'use client'

import type { ComponentType, CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import StatusIconJs from '../transactions/StatusIcon'
import TypeBadgeJs from '../transactions/TypeBadge'
import BatchTypeBadgeJs from '../transactions/BatchTypeBadge'
import { TimeDelta as TimeDeltaJs, NotActive as NotActiveJs } from '../data'
import { CheckmarkIcon, ErrorCircleIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import { Skeleton } from './Skeleton'
import { useLiveList } from './hooks'
import type { Transaction } from '../../types'
import './CompactTxList.css'

// Untyped JS components — loose wrappers until data/* / transactions/* are migrated
const StatusIcon = StatusIconJs as ComponentType<{ status?: string, w?: string, h?: string, className?: string }>
const TypeBadge = TypeBadgeJs as ComponentType<{ type?: string | number, className?: string }>
const BatchTypeBadge = BatchTypeBadgeJs as ComponentType<{ batchType?: string, className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: Date
  showTimestampTooltip?: boolean
  format?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: 'Success',
  FAIL: 'Failed',
  QUEUED: 'Queued',
  POOLED: 'Pooled',
  BROADCASTED: 'Broadcasted'
}

// column-title row aligned to the grid, so the compact list reads like the full tables
function CompactTxHead () {
  return (
    <div className={'CompactTx__Head'} aria-hidden={'true'}>
      <span className={'CompactTx__HeadCell CompactTx__HeadCell--status'}>Status</span>
      <span className={'CompactTx__HeadCell'}>Hash</span>
      <span className={'CompactTx__HeadCell'}>Type</span>
      <span className={'CompactTx__HeadCell CompactTx__HeadCell--time'}>Time</span>
    </div>
  )
}

type CompactTx = Transaction & {
  batchType?: string | null
  hash: string
}

interface CompactTxListProps {
  transactions?: CompactTx[] | null
  limit?: number
  loading?: boolean
  moreHref?: string
  moreLabel?: string
}

// dense latest-transactions list; refreshes are held back while hovered
export function CompactTxList ({
  transactions,
  limit = 6,
  loading,
  moreHref,
  moreLabel
}: CompactTxListProps) {
  const { shown, newKeys, hoverBind } = useLiveList(transactions, tx => tx?.hash ?? '')
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  const footer = moreHref
    ? <Link href={moreHref} prefetch={false} className={'CompactTx__More'}>{moreLabel || 'View all'}</Link>
    : null

  // skeleton mirrors the real row grid so there's no layout shift
  if (loading && !rows.length) {
    return (
      <div className={'CompactTx'}>
        <CompactTxHead/>
        {Array.from({ length: limit }).map((_, i) => (
          <div className={'CompactTx__Row CompactTx__Row--skeleton'} key={i}>
            <span className={'CompactTx__Status'}><Skeleton w={'16px'} circle={true}/></span>
            <span className={'CompactTx__Hash'}><Skeleton w={'72%'} h={'0.8em'}/></span>
            <span className={'CompactTx__Type'}><Skeleton w={'64px'} h={'1.05em'} radius={10}/></span>
            <span className={'CompactTx__Time'}><Skeleton w={'42px'} h={'0.7em'}/></span>
          </div>
        ))}
        {footer}
      </div>
    )
  }

  if (!rows.length) {
    return <div className={'CompactTx__Empty'}>No transactions</div>
  }

  return (
    <div className={'CompactTx'} {...hoverBind}>
      <CompactTxHead/>
      {rows.map((tx, i) => {
        const isNew = newKeys.has(tx.hash as string)
        const style = isNew
          ? ({ '--stagger': `${i * 50}ms` } as CSSProperties)
          : undefined
        return (
        <Link
          key={tx.hash}
          href={`/transaction/${tx.hash}`}
          // rows churn every refresh tick; prefetching each new hash grows the router cache for the tab's lifetime
          prefetch={false}
          className={`CompactTx__Row${isNew ? ' is-new' : ''}`}
          // fresh rows cascade in top-down instead of swapping in one frame
          style={style}
        >
          <span className={'CompactTx__Status'}>
            {tx.status
              ? <Tooltip content={STATUS_LABEL[tx.status] || tx.status} placement={'top'}>
                  <span className={'CompactTx__StatusIcon'}>
                    {/* filled colour disc from the /transactions status badge, minus the label text */}
                    {tx.status === 'SUCCESS'
                      ? <CheckmarkIcon w={'18px'} h={'18px'}/>
                      : tx.status === 'FAIL'
                        ? <ErrorCircleIcon w={'18px'} h={'18px'}/>
                        : <StatusIcon status={tx.status} w={'18px'} h={'18px'}/>}
                  </span>
                </Tooltip>
              : <NotActive/>}
          </span>

          <span className={'CompactTx__Hash'}>
            {tx.hash ? <span className={'CompactTx__HashText'}>{tx.hash}</span> : <NotActive/>}
          </span>

          <span className={'CompactTx__Type'}>
            {tx.batchType
              ? <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')}/>
              : tx.type !== undefined
                ? <TypeBadge type={tx.type ?? undefined}/>
                : <NotActive/>}
          </span>

          <span className={'CompactTx__Time'}>
            {tx.timestamp ? <TimeDelta showTimestampTooltip={true} format={'compact'} endDate={new Date(tx.timestamp)}/> : <NotActive/>}
          </span>
        </Link>
        )
      })}
      {footer}
    </div>
  )
}
