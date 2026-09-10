'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import TypeBadge from './TypeBadge'
import BatchTypeBadge from './BatchTypeBadge'
import TransactionStatusBadge from './TransactionStatusBadge'
import { Identifier, BigNumber, Alias, TimeDelta, NotActive, DateBlock } from '../data'
import { RateTooltip } from '../ui/Tooltips'
import ImageGenerator from '../imageGenerator'
import { LinkContainer } from '../ui/containers'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { ErrorMessageBlock } from '../Errors'
import Pagination from '../pagination'
import type { Transaction } from '../../types'
import { STATUS_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from './TransactionsFilter'

function TransactionsList({
  transactions = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  skeletonCount,
  absoluteDate = false,
  filterValues,
  onFilterChange,
  paging,
  title,
  pinFirst = false
}: {
  transactions?: Transaction[]
  showMoreLink?: any
  headerStyles?: string
  rate?: any
  pagination?: any
  loading?: any
  skeletonCount?: number
  absoluteDate?: boolean
  itemsCount?: number
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  pinFirst?: boolean
}) {
  const router = useRouter()
  const canFilter = Boolean(onFilterChange)

  const columns = [
    {
      key: 'hash',
      header: 'Hash',
      filterKey: canFilter ? 'hash' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Transaction Hash',
      grow: true,
      minWidth: 160,
      cell: (tx: Transaction) =>
        tx?.hash ? (
          <span className={'DataList__Entity'}>
            <Identifier ellipsis={true} copyButton={true}>
              {tx.hash}
            </Identifier>
          </span>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'status',
      header: 'Status',
      filterKey: canFilter ? 'status' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: STATUS_FILTER_OPTIONS,
      minWidth: 96,
      align: 'center',
      priority: 2,
      cell: (tx: Transaction) =>
        tx?.status ? <TransactionStatusBadge status={tx.status} /> : <NotActive />
    },
    {
      key: 'type',
      header: 'Type',
      filterKey: canFilter ? 'type' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: TYPE_FILTER_OPTIONS,
      minWidth: 140,
      cell: (tx: Transaction) =>
        tx?.batchType ? (
          <BatchTypeBadge batchType={tx.batchType?.replace(/[\\""]/g, '')} />
        ) : tx?.type !== undefined ? (
          <TypeBadge type={tx.type} />
        ) : (
          <NotActive />
        )
    },
    {
      key: 'block',
      numeric: true,
      header: 'Block',
      minWidth: 88,
      priority: 3,
      cell: (tx: Transaction) =>
        tx?.blockHeight != null ? (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/block/${tx?.blockHash}`)
            }}
          >
            <BigNumber>{tx.blockHeight}</BigNumber>
          </LinkContainer>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'gasUsed',
      numeric: true,
      header: 'Gas',
      filterKey: canFilter ? 'gas' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      minWidth: 88,
      align: 'center',
      priority: 1,
      cell: (tx: Transaction) =>
        tx?.gasUsed ? (
          <RateTooltip credits={tx.gasUsed} rate={rate} placement={'top'}>
            <span>
              <BigNumber>{tx.gasUsed}</BigNumber>
            </span>
          </RateTooltip>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'owner',
      header: 'Owner',
      filterKey: canFilter ? 'owner' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Owner ID',
      grow: true,
      minWidth: 120,
      priority: 4,
      cell: (tx: Transaction) => {
        if (!tx?.owner?.identifier) return <NotActive>-</NotActive>
        const activeAlias = tx?.owner?.aliases?.find((alias: any) => alias.status === 'ok')
        return (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${tx?.owner?.identifier}`)
            }}
          >
            {activeAlias ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ImageGenerator
                  className={'Identifier__Avatar'}
                  username={tx?.owner?.identifier}
                  lightness={50}
                  saturation={50}
                  width={24}
                  height={24}
                />
                <Alias
                  alias={
                    typeof activeAlias?.alias === 'string'
                      ? activeAlias.alias
                      : String(activeAlias?.alias || '')
                  }
                />
              </div>
            ) : (
              <Identifier avatar={true} copyButton={true} ellipsis={true}>
                {tx?.owner?.identifier}
              </Identifier>
            )}
          </LinkContainer>
        )
      }
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      filterKey: canFilter ? 'timestamp' : undefined,
      filterType: canFilter ? ('daterange' as const) : undefined,
      minWidth: absoluteDate ? 148 : 128,
      align: 'right',
      cell: (tx: Transaction) => {
        if (!tx?.timestamp) return <NotActive />
        return absoluteDate ? (
          <DateBlock
            format={'dateOnly'}
            showTime={true}
            timestamp={tx.timestamp}
            showRelativeTooltip={true}
          />
        ) : (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(tx.timestamp)} />
        )
      }
    }
  ]

  if (transactions === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'TransactionsList'}
      items={transactions}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      skeletonCount={skeletonCount}
      rowHref={(tx: Transaction) => `/transaction/${tx?.hash}`}
      rowKey={(tx: Transaction) => tx?.hash ?? ''}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No transactions match these filters.'
          : 'There are no transactions yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      footer={
        pagination ? (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount}
            forcePage={pagination.forcePage}
            justify={true}
          />
        ) : showMoreLink ? (
          <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>
            Show more
          </Link>
        ) : undefined
      }
    />
  )
}

export default TransactionsList
