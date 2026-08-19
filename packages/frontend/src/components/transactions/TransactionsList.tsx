'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TypeBadge from './TypeBadge'
import BatchTypeBadge from './BatchTypeBadge'
import TransactionStatusBadge from './TransactionStatusBadge'
import { Identifier, BigNumber, Alias, TimeDelta, NotActive, DateBlock } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import ImageGenerator from '../imageGenerator'
import { LinkContainer } from '../ui/containers'
import { DataList } from '../ui/lists'
import { ErrorMessageBlock } from '../Errors'
import Pagination from '../pagination'
import type { Transaction } from '../../types'

function TransactionsList ({
  transactions = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  absoluteDate = false
}: {
  transactions?: Transaction[]
  showMoreLink?: any
  headerStyles?: string
  rate?: any
  pagination?: any
  loading?: any
  absoluteDate?: boolean
  itemsCount?: number
}) {
  const router = useRouter()

  const columns = [
    {
      key: 'status',
      header: 'Status',
      minWidth: 96,
      align: 'center',
      priority: 2,
      cell: (tx: Transaction) => (tx?.status ? <TransactionStatusBadge status={tx.status}/> : <NotActive/>)
    },
    {
      key: 'hash',
      header: 'Hash',
      grow: 2,
      minWidth: 120,
      cell: (tx: Transaction) => (tx?.hash ? <Identifier middleEllipsis={true} copyButton={true}>{tx.hash}</Identifier> : <NotActive/>)
    },
    {
      key: 'block',
      header: 'Block',
      minWidth: 72,
      priority: 3,
      cell: (tx: Transaction) => (tx?.blockHeight != null
        ? <LinkContainer onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/block/${tx?.blockHash}`) }}>
            <BigNumber>{tx.blockHeight}</BigNumber>
          </LinkContainer>
        : <NotActive/>)
    },
    {
      key: 'gasUsed',
      header: 'Gas used',
      minWidth: 140,
      align: 'center',
      priority: 1,
      cell: (tx: Transaction) => (tx?.gasUsed
        ? <RateTooltip credits={tx.gasUsed} rate={rate} placement={'top'}>
            <span><BigNumber>{tx.gasUsed}</BigNumber> Credits</span>
          </RateTooltip>
        : <NotActive/>)
    },
    {
      key: 'owner',
      header: 'Owner',
      grow: 2,
      minWidth: 120,
      priority: 4,
      cell: (tx: Transaction) => {
        if (!tx?.owner?.identifier) return <NotActive>-</NotActive>
        const activeAlias = tx?.owner?.aliases?.find((alias: any) => alias.status === 'ok')
        return (
          <LinkContainer onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/identity/${tx?.owner?.identifier}`) }}>
            {activeAlias
              ? <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ImageGenerator className={'Identifier__Avatar'} username={tx?.owner?.identifier} lightness={50} saturation={50} width={24} height={24}/>
                  <Alias alias={typeof activeAlias?.alias === 'string' ? activeAlias.alias : String(activeAlias?.alias || '')}/>
                </div>
              : <Identifier avatar={true} copyButton={true}>{tx?.owner?.identifier}</Identifier>}
          </LinkContainer>
        )
      }
    },
    {
      key: 'type',
      header: 'Type',
      minWidth: 140,
      cell: (tx: Transaction) => (tx?.batchType
        ? <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')}/>
        : tx?.type !== undefined
          ? <TypeBadge type={tx.type}/>
          : <NotActive/>)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: absoluteDate ? 132 : 96,
      align: 'right',
      cell: (tx: Transaction) => {
        if (!tx?.timestamp) return <NotActive/>
        return absoluteDate
          ? <DateBlock format={'dateOnly'} showTime={true} timestamp={tx.timestamp} showRelativeTooltip={true}/>
          : <TimeDelta showTimestampTooltip={true} endDate={new Date(tx.timestamp)}/>
      }
    }
  ]

  if (transactions === undefined) return <ErrorMessageBlock/>

  return (
    <DataList
      className={'TransactionsList'}
      items={transactions}
      columns={columns}
      loading={loading}
      rowHref={(tx: Transaction) => `/transaction/${tx?.hash}`}
      rowKey={(tx: Transaction) => tx?.hash ?? ''}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no transactions yet.'}
      footer={pagination
        ? <Pagination onPageChange={pagination.onPageChange} pageCount={pagination.pageCount} forcePage={pagination.forcePage} justify={true}/>
        : showMoreLink
          ? <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>
          : undefined}
    />
  )
}

export default TransactionsList
