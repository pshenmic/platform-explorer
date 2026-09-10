'use client'

import { columnLayout } from './DataContractsList.columns'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { DataContractsListItemData } from './DataContractsListItem'
import { Alias, Identifier, BigNumber, NotActive, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import { Badge } from '../ui/Badge'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

const WITH_TOKENS_OPTIONS = [
  {
    value: 'true',
    label: <Badge colorScheme={'orange'}>true</Badge>,
    searchText: 'true yes with tokens'
  },
  {
    value: 'false',
    label: <Badge colorScheme={'gray'}>false</Badge>,
    searchText: 'false no without tokens'
  }
]
const SYSTEM_OPTIONS = [
  {
    value: 'true',
    label: <Badge colorScheme={'orange'}>true</Badge>,
    searchText: 'true system'
  },
  {
    value: 'false',
    label: <Badge colorScheme={'gray'}>false</Badge>,
    searchText: 'false'
  }
]

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface DataContractsListProps {
  dataContracts?: DataContractsListItemData[]
  headerStyles?: string
  pagination?: PaginationProps | null
  loading?: boolean
  itemsCount?: number
  enteringKeys?: Set<string>
  leavingKeys?: Set<string>
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  titleExtra?: ReactNode
  pinFirst?: boolean
}

function ownerIdOf(item: DataContractsListItemData) {
  return typeof item?.owner === 'object' ? item?.owner?.identifier : item?.owner
}

function ownerNameOf(item: DataContractsListItemData) {
  return typeof item?.owner === 'object' ? item?.owner?.name || null : null
}

function contractColumns(canFilter: boolean, router: ReturnType<typeof useRouter>) {
  return [
    {
      ...columnLayout.identifier,
      filterKey: canFilter ? 'identifier' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Contract ID or name',
      cell: (item: DataContractsListItemData) => (
        <span className={'DataList__Entity'}>
          {item?.name ? (
            <Alias avatarSource={item?.identifier}>{item.name}</Alias>
          ) : (
            <Identifier avatar={true} styles={['highlight-both']} ellipsis={true}>
              {item.identifier}
            </Identifier>
          )}
        </span>
      )
    },
    {
      ...columnLayout.owner,
      filterKey: canFilter ? 'owner' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Owner ID',
      priority: 2,
      cell: (item: DataContractsListItemData) => {
        const ownerId = ownerIdOf(item)
        const ownerName = ownerNameOf(item)
        if (!ownerId) return <NotActive />
        return (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${ownerId}`)
            }}
          >
            {ownerName ? (
              <Alias avatarSource={ownerId}>{ownerName}</Alias>
            ) : (
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {ownerId}
              </Identifier>
            )}
          </LinkContainer>
        )
      }
    },
    {
      ...columnLayout.system,
      filterKey: canFilter ? 'system' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: SYSTEM_OPTIONS,
      priority: 1,
      cell: (item: DataContractsListItemData) =>
        item?.isSystem !== undefined ? (
          <Badge colorScheme={item?.isSystem ? 'orange' : 'gray'}>
            {item?.isSystem ? 'true' : 'false'}
          </Badge>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.withTokens,
      filterKey: canFilter ? 'with_tokens' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: WITH_TOKENS_OPTIONS,
      priority: 1,
      cell: (item: DataContractsListItemData) =>
        Number.isNaN(Number(item?.tokensCount)) ? (
          <NotActive />
        ) : (
          <Badge colorScheme={(item?.tokensCount ?? 0) > 0 ? 'orange' : 'gray'}>
            {(item?.tokensCount ?? 0) > 0 ? 'true' : 'false'}
          </Badge>
        )
    },
    {
      ...columnLayout.documents,
      filterKey: canFilter ? 'documents' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      priority: 3,
      cell: (item: DataContractsListItemData) =>
        item?.documentsCount == null ? (
          <NotActive />
        ) : (
          <Badge colorScheme={(item.documentsCount ?? 0) > 0 ? 'gray' : 'dimGray'} size={'xs'}>
            <BigNumber>{item.documentsCount}</BigNumber>
          </Badge>
        )
    },
    {
      ...columnLayout.timestamp,
      filterKey: canFilter ? 'timestamp' : undefined,
      filterType: canFilter ? ('daterange' as const) : undefined,
      cell: (item: DataContractsListItemData) =>
        !item?.timestamp && item?.isSystem ? (
          <span>Genesis</span>
        ) : (
          <TimeDelta endDate={item?.timestamp} />
        )
    }
  ]
}

function DataContractsList({
  dataContracts = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10,
  enteringKeys,
  leavingKeys,
  filterValues,
  onFilterChange,
  paging,
  title,
  titleExtra,
  pinFirst = false
}: DataContractsListProps) {
  const router = useRouter()
  const columns = contractColumns(Boolean(onFilterChange), router)

  if (dataContracts === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'DataContractsList'}
      items={dataContracts}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={item => `/dataContract/${item?.identifier}`}
      rowKey={item => item?.identifier || ''}
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      titleExtra={titleExtra}
      rowClassName={item => {
        const id = item?.identifier || ''
        if (leavingKeys?.has(id)) return 'is-exit'
        if (enteringKeys?.has(id)) return 'is-new is-insert'
        return ''
      }}
      rowStyle={(item: DataContractsListItemData, i: number) => {
        const id = item?.identifier || ''
        const index = i ?? 0
        if (leavingKeys?.has(id)) {
          return { ['--stagger']: `${Math.max(0, (leavingKeys.size - 1 - index) * 45)}ms` }
        }
        if (enteringKeys?.has(id)) {
          return { ['--stagger']: `${index * 45}ms` }
        }
        return undefined
      }}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No data contracts match these filters.'
          : 'There are no data contracts created yet.'
      }
      footer={
        pagination ? (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount}
            forcePage={pagination.forcePage}
            justify={true}
          />
        ) : null
      }
    />
  )
}

export default DataContractsList
