'use client'

import Link from 'next/link'
import StatusIcon from '../transactions/StatusIcon'
import TypeBadge from '../transactions/TypeBadge'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { TimeDelta, NotActive } from '../data'
import { Tooltip } from '../ui/Tooltips'
import { Skeleton } from './Skeleton'
import { useLiveList } from './hooks'
import './CompactTxList.scss'

const STATUS_LABEL = {
  SUCCESS: 'Success',
  FAIL: 'Failed',
  QUEUED: 'Queued',
  POOLED: 'Pooled',
  BROADCASTED: 'Broadcasted'
}

// dense latest-transactions list; refreshes are held back while hovered
export function CompactTxList ({ transactions, limit = 7, loading }) {
  const { shown, newKeys, hoverBind } = useLiveList(transactions, tx => tx?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  // skeleton mirrors the real row grid so there's no layout shift
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
    <div className={'CompactTx'} {...hoverBind}>
      {rows.map((tx, i) => (
        <Link
          key={tx.hash}
          href={`/transaction/${tx.hash}`}
          // rows churn every refresh tick; prefetching each new hash grows the router cache for the tab's lifetime
          prefetch={false}
          className={`CompactTx__Row${newKeys.has(tx.hash) ? ' is-new' : ''}`}
          // fresh rows cascade in top-down instead of swapping in one frame
          style={newKeys.has(tx.hash) ? { '--stagger': `${i * 50}ms` } : undefined}
        >
          <span className={'CompactTx__Status'}>
            {tx.status
              ? <Tooltip content={STATUS_LABEL[tx.status] || tx.status} placement={'top'}>
                  <span className={'CompactTx__StatusIcon'}><StatusIcon status={tx.status} w={'18px'} h={'18px'}/></span>
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
