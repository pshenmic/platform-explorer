'use client'

import type { ReactNode } from 'react'
import type { Identity } from '../../types'
import { Identifier, Alias, BigNumber, NotActive, TimeDelta } from '../data'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../ui/icons'
import { Badge } from '../ui/Badge'
import { RateTooltip } from '../ui/Tooltips'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

const TYPE_OPTIONS = [
  {
    value: 'regular',
    label: <Badge colorScheme={'gray'}>Regular</Badge>,
    searchText: 'regular identity'
  },
  {
    value: 'masternode',
    label: <Badge colorScheme={'orange'}>Masternode</Badge>,
    searchText: 'masternode validator'
  }
]

interface IdentitiesListProps {
  identities?: Identity[]
  headerStyles?: string
  pagination?: {
    onPageChange?: (p: { selected: number }) => void
    pageCount?: number
    forcePage?: number
  } | null
  loading?: boolean
  itemsCount?: number
  sort?: { order_by?: string; order?: string } | null
  sortDefault?: { order_by: string; order: string }
  onSortChange?: (v: { order_by: string; order: string }) => void
  page?: number
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  pinFirst?: boolean
}

function compactAmount(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1_000_000) return value.toLocaleString('en-US')
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(
    value
  )
}

const renderCount = (value: unknown) => {
  if (value == null || !Number.isFinite(Number(value))) return <NotActive>—</NotActive>
  const n = Number(value)
  return (
    <Badge colorScheme={n > 0 ? 'gray' : 'dimGray'} size={'xs'}>
      <BigNumber>{String(value)}</BigNumber>
    </Badge>
  )
}

function identityTypeOf(identity: Identity) {
  if (identity.isSystem) return 'system'
  if (!identity.timestamp) return 'masternode'
  return 'regular'
}

function IdentitiesList({
  identities,
  headerStyles = 'default',
  pagination,
  loading,
  itemsCount = 10,
  sort,
  sortDefault,
  onSortChange,
  page = 0,
  filterValues,
  onFilterChange,
  paging,
  title,
  pinFirst = false
}: IdentitiesListProps) {
  const canFilter = Boolean(onFilterChange)
  const showRank =
    sort?.order === 'desc' &&
    ['balance', 'tx_count', 'documents_count'].includes(sort?.order_by as string) &&
    page === 0

  if (identities === undefined && !loading) return <ErrorMessageBlock />

  const columns = [
    {
      key: 'identifier',
      header: 'Identity',
      filterKey: canFilter ? 'identifier' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Identity ID or name',
      grow: true,
      minWidth: 168,
      cell: (identity: Identity, index?: number) => {
        const place = showRank && (index ?? 0) < 3 ? (index ?? 0) + 1 : undefined
        const PlaceIcon = placeIcons[place as 1 | 2 | 3]
        const activeAlias = identity.aliases?.find(
          (alias: { status?: string }) => alias?.status === 'ok'
        )
        return (
          <span className={'DataList__Entity'}>
            {PlaceIcon && <PlaceIcon className={'DataList__Medal'} />}
            {activeAlias ? (
              <Alias
                ellipsis={true}
                alias={activeAlias?.alias}
                avatarSource={identity.identifier}
              />
            ) : (
              <Identifier ellipsis={true} avatar={true} copyButton={true}>
                {identity.identifier}
              </Identifier>
            )}
          </span>
        )
      }
    },
    {
      key: 'type',
      header: 'Type',
      filterKey: canFilter ? 'identity_type' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: TYPE_OPTIONS,
      minWidth: 120,
      cell: (identity: Identity) => {
        const type = identityTypeOf(identity)
        if (type === 'system') return <Badge colorScheme={'orange'}>System</Badge>
        if (type === 'masternode') return <Badge colorScheme={'orange'}>Masternode</Badge>
        return <Badge colorScheme={'gray'}>Regular</Badge>
      }
    },
    {
      key: 'balance',
      header: 'Balance',
      filterKey: canFilter ? 'balance' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      minWidth: 96,
      sortKey: 'balance',
      cell: (identity: Identity) => {
        if (identity.balance == null) return <NotActive>—</NotActive>
        const credits = Number(identity.balance)
        return (
          <RateTooltip credits={credits}>
            <span className={'DataList__CompactNum'}>{compactAmount(credits)}</span>
          </RateTooltip>
        )
      }
    },
    {
      key: 'txs',
      header: 'Transactions',
      filterKey: canFilter ? 'tx_count' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      minWidth: 108,
      align: 'center',
      sortKey: 'tx_count',
      priority: 2,
      cell: (identity: Identity) => renderCount(identity.totalTxs)
    },
    {
      key: 'documents',
      header: 'Documents',
      filterKey: canFilter ? 'documents_count' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      minWidth: 108,
      align: 'center',
      priority: 2,
      cell: (identity: Identity) => renderCount(identity.totalDocuments)
    },
    {
      key: 'contracts',
      header: 'Data Contracts',
      filterKey: canFilter ? 'data_contracts' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      minWidth: 120,
      align: 'center',
      priority: 1,
      cell: (identity: Identity) => renderCount(identity.totalDataContracts)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 128,
      align: 'right',
      cell: (identity: Identity) =>
        identity.timestamp ? (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(identity.timestamp)} />
        ) : identity.isSystem ? (
          <span className={'IdentitiesList__Genesis'}>Genesis</span>
        ) : (
          <NotActive />
        )
    }
  ]

  return (
    <DataList
      className={'IdentitiesList'}
      items={identities || []}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={identity => `/identity/${identity.identifier}`}
      rowKey={identity => identity.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No identities match these filters.'
          : 'There are no identities yet.'
      }
      rowClassName={(identity, index) => {
        const place = showRank && index < 3 ? index + 1 : undefined
        return place ? `DataList__Row--Rank${place}` : ''
      }}
      sort={sort || undefined}
      sortDefault={sortDefault}
      onSortChange={onSortChange}
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      footer={
        pagination ? (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount ?? 0}
            forcePage={pagination.forcePage ?? 0}
            justify={true}
          />
        ) : null
      }
    />
  )
}

export default IdentitiesList
