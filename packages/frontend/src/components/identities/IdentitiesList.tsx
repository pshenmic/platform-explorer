'use client'

import type { Identity, Document } from '../../types'
import IdentitiesListItem from './IdentitiesListItem'
import { EmptyListMessage } from '../ui/lists'
import { ChevronIcon } from '../ui/icons'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'

import './IdentitiesList.css'

const SORTABLE_HEADERS = [
  { key: 'balance', modifier: 'Balance', label: 'Balance' },
  { key: 'tx_count', modifier: 'Txs', label: 'Transactions' },
  { key: 'documents_count', modifier: 'Documents', label: 'Documents' },
  { key: 'timestamp', modifier: 'Timestamp', label: 'Timestamp' }
]

interface SortableHeaderProps {
  headerKey?: string
  label?: string
  modifier?: string
  sort?: { order_by?: string; order?: string } | null
  onSortChange?: (v: Record<string, unknown>) => void
}

function SortableHeader({ headerKey, label, modifier, sort, onSortChange }: SortableHeaderProps) {
  const isActive = sort?.order_by === headerKey
  const direction = isActive ? sort?.order : null
  const className = [
    'IdentitiesList__ColumnTitle',
    `IdentitiesList__ColumnTitle--${modifier}`,
    'IdentitiesList__ColumnTitle--Sortable',
    isActive ? 'IdentitiesList__ColumnTitle--Active' : ''
  ]
    .filter(Boolean)
    .join(' ')

  const handleClick = () => {
    if (!onSortChange) return
    const nextOrder = isActive && direction === 'desc' ? 'asc' : 'desc'
    onSortChange({ order_by: headerKey, order: nextOrder })
  }

  return (
    <button type={'button'} className={className} onClick={handleClick}>
      {isActive ? (
        <ChevronIcon
          w={4}
          h={4}
          transform={direction === 'asc' ? 'rotate(-90deg)' : 'rotate(90deg)'}
        />
      ) : (
        <span aria-hidden className={'IdentitiesList__SortSpacer'} />
      )}
      <span>{label}</span>
    </button>
  )
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
  const headerExtraClass: Record<string, string> = {
    default: '',
    light: 'IdentitiesList__ColumnTitles--Light'
  }

  const showRank =
    sort?.order === 'desc' &&
    ['balance', 'tx_count', 'documents_count'].includes(sort?.order_by as string) &&
    page === 0

  const sortableProps = (key: string) => {
    const header = SORTABLE_HEADERS.find(h => h.key === key)
    return {
      headerKey: header!.key,
      label: header!.label,
      modifier: header!.modifier,
      sort,
      onSortChange
    }
  }

  return (
    <div className={'IdentitiesList'}>
      <div
        className={`IdentitiesList__ColumnTitles ${headerExtraClass[headerStyles ?? 'default'] || ''}`}
      >
        <div className={'IdentitiesList__ColumnTitle IdentitiesList__ColumnTitle--Identifier'}>
          Identifier
        </div>
        <SortableHeader {...sortableProps('balance')} />
        <SortableHeader {...sortableProps('tx_count')} />
        <SortableHeader {...sortableProps('documents_count')} />
        <div className={'IdentitiesList__ColumnTitle IdentitiesList__ColumnTitle--Contracts'}>
          Data Contracts
        </div>
        <SortableHeader {...sortableProps('timestamp')} />
      </div>

      {!loading ? (
        <div className={'IdentitiesList__Items'}>
          {identities?.map((identity, key) => (
            <IdentitiesListItem
              key={key}
              identity={identity}
              place={showRank && key < 3 ? key + 1 : undefined}
            />
          ))}
          {!identities?.length && <EmptyListMessage>There are no identities yet.</EmptyListMessage>}
          {identities === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}

      {pagination && (
        <Pagination
          className={'IdentitiesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount ?? 0}
          forcePage={pagination.forcePage ?? 0}
          justify={true}
        />
      )}
    </div>
  )
}

export default IdentitiesList
