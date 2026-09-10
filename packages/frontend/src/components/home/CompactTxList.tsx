'use client'

import Link from 'next/link'
import StatusIcon from '../transactions/StatusIcon'
import TypeBadge from '../transactions/TypeBadge'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { TimeDelta, NotActive, Identifier } from '../data'
import { CheckmarkIcon, ErrorCircleIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import { useLiveList } from './hooks'
import { HOME_FEED_LIMIT } from './listLimits'
import './CompactTxList.css'

const STATUS_LABEL = {
  SUCCESS: 'Success',
  FAIL: 'Failed',
  QUEUED: 'Queued',
  POOLED: 'Pooled',
  BROADCASTED: 'Broadcasted'
}

function StatusCell({ tx }: { tx: any }) {
  if (!tx.status) return <NotActive />
  return (
    <Tooltip content={(STATUS_LABEL as any)[tx.status] || tx.status} placement={'top'}>
      <span style={{ display: 'flex' }}>
        {tx.status === 'SUCCESS' ? (
          <CheckmarkIcon w={'18px'} h={'18px'} />
        ) : tx.status === 'FAIL' ? (
          <ErrorCircleIcon w={'18px'} h={'18px'} />
        ) : (
          <StatusIcon status={tx.status} w={'18px'} h={'18px'} />
        )}
      </span>
    </Tooltip>
  )
}

function TypeCell({ tx }: { tx: any }) {
  if (tx.batchType) {
    return <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')} />
  }
  if (tx.type !== undefined) return <TypeBadge type={tx.type} />
  return <NotActive />
}

export function CompactTxList({
  transactions,
  limit = HOME_FEED_LIMIT,
  loading,
  moreHref,
  moreLabel
}: any) {
  const { shown, newKeys, hoverBind } = useLiveList<any>(transactions, (tx: any) => tx?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []
  const showSkeleton = Boolean(loading && !rows.length)

  return (
    <div className={'CompactTxList'} {...hoverBind}>
      <div className={'CompactTxList__Head'}>
        <div className={'CompactTxList__HeadCell CompactTxList__HeadCell--center'}>Status</div>
        <div className={'CompactTxList__HeadCell'}>Hash</div>
        <div className={'CompactTxList__HeadCell'}>Type</div>
        <div className={'CompactTxList__HeadCell CompactTxList__HeadCell--right'}>Time</div>
      </div>
      <div className={'CompactTxList__Body'}>
        {showSkeleton
          ? Array.from({ length: limit }, (_, i) => (
              <div key={i} className={'CompactTxList__Row CompactTxList__Row--Skeleton'}>
                <div className={'CompactTxList__Cell CompactTxList__Cell--center'}>
                  <span className={'CompactTxList__Skeleton'} />
                </div>
                <div className={'CompactTxList__Cell'}>
                  <span className={'CompactTxList__Skeleton'} />
                </div>
                <div className={'CompactTxList__Cell'}>
                  <span className={'CompactTxList__Skeleton'} />
                </div>
                <div className={'CompactTxList__Cell CompactTxList__Cell--right'}>
                  <span className={'CompactTxList__Skeleton'} />
                </div>
              </div>
            ))
          : null}
        {!showSkeleton && rows.length === 0 ? (
          <div className={'CompactTxList__Empty'}>No transactions</div>
        ) : null}
        {rows.map((tx: any, i: number) => {
          const hash = tx?.hash
          const isNew = hash && newKeys.has(hash)
          return (
            <Link
              key={hash || i}
              href={`/transaction/${hash}`}
              prefetch={false}
              className={`CompactTxList__Row${isNew ? ' is-new' : ''}`}
              style={isNew ? ({ ['--stagger']: `${i * 50}ms` } as any) : undefined}
            >
              <div className={'CompactTxList__Cell CompactTxList__Cell--center'}>
                <StatusCell tx={tx} />
              </div>
              <div className={'CompactTxList__Cell'}>
                {hash ? (
                  <Identifier ellipsis={true} styles={['highlight-both']}>
                    {hash}
                  </Identifier>
                ) : (
                  <NotActive />
                )}
              </div>
              <div className={'CompactTxList__Cell'}>
                <TypeCell tx={tx} />
              </div>
              <div className={'CompactTxList__Cell CompactTxList__Cell--right'}>
                {tx.timestamp ? (
                  <TimeDelta
                    showTimestampTooltip={true}
                    format={'compact'}
                    endDate={new Date(tx.timestamp)}
                  />
                ) : (
                  <NotActive />
                )}
              </div>
            </Link>
          )
        })}
      </div>
      {moreHref ? (
        <div className={'CompactTxList__Footer'}>
          <Link href={moreHref} prefetch={false} className={'CompactTxList__More'}>
            {moreLabel || 'View all'}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
