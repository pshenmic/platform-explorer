'use client'

import StatusIcon from '../transactions/StatusIcon'
import TypeBadge from '../transactions/TypeBadge'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { TimeDelta, NotActive, Identifier } from '../data'
import { CheckmarkIcon, ErrorCircleIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import { DataList } from '../ui/lists'
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

export function CompactTxList ({
  transactions,
  limit = HOME_FEED_LIMIT,
  loading
}) {
  const { shown, newKeys, hoverBind } = useLiveList(transactions, tx => tx?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []

  const columns = [
    {
      key: 'status',
      header: 'Status',
      minWidth: 56,
      align: 'center',
      cell: (tx) => (tx.status
        ? <Tooltip content={STATUS_LABEL[tx.status] || tx.status} placement={'top'}>
            <span style={{ display: 'flex' }}>
              {tx.status === 'SUCCESS'
                ? <CheckmarkIcon w={'18px'} h={'18px'}/>
                : tx.status === 'FAIL'
                  ? <ErrorCircleIcon w={'18px'} h={'18px'}/>
                  : <StatusIcon status={tx.status} w={'18px'} h={'18px'}/>}
            </span>
          </Tooltip>
        : <NotActive/>)
    },
    {
      key: 'hash',
      header: 'Hash',
      grow: true,
      minWidth: 96,
      cell: (tx) => (tx.hash
        ? <Identifier ellipsis={true} styles={['highlight-both']}>{tx.hash}</Identifier>
        : <NotActive/>)
    },
    {
      key: 'type',
      header: 'Type',
      minWidth: 88,
      cell: (tx) => (tx.batchType
        ? <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')}/>
        : tx.type !== undefined
          ? <TypeBadge type={tx.type}/>
          : <NotActive/>)
    },
    {
      key: 'time',
      header: 'Time',
      minWidth: 48,
      align: 'right',
      cell: (tx) => (tx.timestamp
        ? <TimeDelta showTimestampTooltip={true} format={'compact'} endDate={new Date(tx.timestamp)}/>
        : <NotActive/>)
    }
  ]

  return (
    <DataList
      className={'CompactTxList'}
      items={rows}
      columns={columns}
      loading={loading && !rows.length}
      skeletonCount={limit}
      emptyMessage={'No transactions'}
      rowHref={(tx) => `/transaction/${tx.hash}`}
      rowKey={(tx) => tx.hash}
      rowClassName={(tx) => (newKeys.has(tx.hash) ? 'is-new' : '')}
      rowStyle={(tx, i) => (newKeys.has(tx.hash) ? { '--stagger': `${i * 50}ms` } : undefined)}
      wrapperProps={hoverBind}
    />
  )
}
