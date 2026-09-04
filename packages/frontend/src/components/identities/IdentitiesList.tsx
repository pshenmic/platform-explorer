'use client'

import type { Identity } from '../../types'
import { Identifier, Alias, DateBlock, BigNumber, NotActive } from '../data'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../ui/icons'
import { DataList } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

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
  onSortChange?: (v: Record<string, unknown>) => void
  page?: number
}

const renderCount = (value: unknown) =>
  value != null && Number.isFinite(Number(value)) ? (
    <BigNumber>{String(value)}</BigNumber>
  ) : (
    <NotActive>—</NotActive>
  )

function IdentitiesList({
  identities,
  headerStyles = 'default',
  pagination,
  loading,
  itemsCount = 10,
  sort,
  onSortChange,
  page = 0
}: IdentitiesListProps) {
  const showRank =
    sort?.order === 'desc' &&
    ['balance', 'tx_count', 'documents_count'].includes(sort?.order_by as string) &&
    page === 0

  if (identities === undefined && !loading) return <ErrorMessageBlock />

  const columns = [
    {
      key: 'identifier',
      header: 'Identifier',
      grow: true,
      minWidth: 160,
      cell: (identity: Identity, index?: number) => {
        const place = showRank && (index ?? 0) < 3 ? (index ?? 0) + 1 : undefined
        const PlaceIcon = placeIcons[place as 1 | 2 | 3]
        const activeAlias = identity.aliases?.find(
          (alias: { status?: string }) => alias?.status === 'ok'
        )
        return (
          <>
            {PlaceIcon && <PlaceIcon className={'DataList__Medal'} />}
            {activeAlias ? (
              <Alias alias={activeAlias?.alias} avatarSource={identity.identifier} />
            ) : (
              <Identifier middleEllipsis={true} avatar={true} copyButton={true}>
                {identity.identifier}
              </Identifier>
            )}
          </>
        )
      }
    },
    {
      key: 'balance',
      header: 'Balance',
      minWidth: 100,
      sortKey: 'balance',
      cell: (identity: Identity) =>
        identity.balance != null ? (
          <BigNumber>{String(identity.balance)}</BigNumber>
        ) : (
          <NotActive>—</NotActive>
        )
    },
    {
      key: 'txs',
      header: 'Transactions',
      minWidth: 88,
      align: 'center',
      sortKey: 'tx_count',
      priority: 2,
      cell: (identity: Identity) => renderCount(identity.totalTxs)
    },
    {
      key: 'documents',
      header: 'Documents',
      minWidth: 88,
      align: 'center',
      sortKey: 'documents_count',
      priority: 2,
      cell: (identity: Identity) => renderCount(identity.totalDocuments)
    },
    {
      key: 'contracts',
      header: 'Data Contracts',
      minWidth: 96,
      align: 'center',
      priority: 1,
      cell: (identity: Identity) => renderCount(identity.totalDataContracts)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 132,
      align: 'right',
      sortKey: 'timestamp',
      cell: (identity: Identity) => (
        <>
          {identity.isSystem && <div>SYSTEM</div>}
          {typeof identity.timestamp === 'string' && (
            <DateBlock
              format={'dateOnly'}
              showTime={true}
              timestamp={identity.timestamp}
              showRelativeTooltip={true}
            />
          )}
        </>
      )
    }
  ]

  return (
    <DataList
      className={'IdentitiesList'}
      items={identities || []}
      columns={columns}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={identity => `/identity/${identity.identifier}`}
      rowKey={identity => identity.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no identities yet.'}
      rowClassName={(identity, index) => {
        const place = showRank && index < 3 ? index + 1 : undefined
        return place ? `DataList__Row--Rank${place}` : ''
      }}
      sort={sort || undefined}
      onSortChange={
        onSortChange
          ? next => onSortChange(next)
          : undefined
      }
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
