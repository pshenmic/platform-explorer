'use client'

import Link from 'next/link'
import StatusIcon from '../transactions/StatusIcon'
import TypeBadge from '../transactions/TypeBadge'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { Identifier, TimeDelta, NotActive } from '../data'
import { Tooltip } from '../ui/Tooltips'
import { Skeleton } from './Skeleton'
import './CompactTxList.scss'

const STATUS_LABEL = {
  SUCCESS: 'Success',
  FAIL: 'Failed',
  QUEUED: 'Queued',
  POOLED: 'Pooled',
  BROADCASTED: 'Broadcasted'
}

// Dense latest-transactions list for the Network overview column: icon-only status (tooltip),
// hash, type badge, relative time (full timestamp in tooltip). No gas/owner/block columns.
export function CompactTxList ({ transactions, limit = 7, loading }) {
  const rows = Array.isArray(transactions) ? transactions.slice(0, limit) : []

  // skeleton shell while loading — same row grid (44px, 4 cols) so the swap doesn't shift layout
  if (loading && !rows.length) {
    return (
      <div className={'CompactTx'}>
        {Array.from({ length: limit }).map((_, i) => (
          <div className={'CompactTx__Row CompactTx__Row--skeleton'} key={i}>
            <span className={'CompactTx__Status'}><Skeleton w={'16px'} circle={true}/></span>
            <span className={'CompactTx__Hash'}><Skeleton w={'72%'} h={'0.8em'}/></span>
            <span className={'CompactTx__Type'}><Skeleton w={'64px'} h={'1.05em'} radius={10}/></span>
            <span className={'CompactTx__Time'}><Skeleton w={'42px'} h={'0.7em'}/></span>
          </div>
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return <div className={'CompactTx__Empty'}>No transactions</div>
  }

  return (
    <div className={'CompactTx'}>
      {rows.map(tx => (
        <Link key={tx.hash} href={`/transaction/${tx.hash}`} className={'CompactTx__Row'}>
          <span className={'CompactTx__Status'}>
            {tx.status
              ? <Tooltip content={STATUS_LABEL[tx.status] || tx.status} placement={'top'}>
                  <span className={'CompactTx__StatusIcon'}><StatusIcon status={tx.status} w={'16px'} h={'16px'}/></span>
                </Tooltip>
              : <NotActive/>}
          </span>

          <span className={'CompactTx__Hash'}>
            {tx.hash ? <Identifier middleEllipsis={true}>{tx.hash}</Identifier> : <NotActive/>}
          </span>

          <span className={'CompactTx__Type'}>
            {tx.batchType
              ? <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')}/>
              : tx.type !== undefined
                ? <TypeBadge type={tx.type}/>
                : <NotActive/>}
          </span>

          <span className={'CompactTx__Time'}>
            {tx.timestamp ? <TimeDelta showTimestampTooltip={true} endDate={new Date(tx.timestamp)}/> : <NotActive/>}
          </span>
        </Link>
      ))}
    </div>
  )
}
