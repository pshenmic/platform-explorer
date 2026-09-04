'use client'

import type { DataContractsListItemData } from './DataContractsListItem'
import { Alias, Identifier, BigNumber, NotActive, DateBlock } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import { Badge } from '../ui/Badge'
import { DataList } from '../ui/lists'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

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
}

function ownerIdOf(item: DataContractsListItemData) {
  return typeof item?.owner === 'object' ? item?.owner?.identifier : item?.owner
}

function ownerNameOf(item: DataContractsListItemData) {
  return typeof item?.owner === 'object' ? item?.owner?.name || null : null
}

function contractColumns() {
  return [
    {
      key: 'identifier',
      header: 'Identifier',
      grow: true,
      minWidth: 140,
      cell: (item: DataContractsListItemData) =>
        item?.name ? (
          <Alias avatarSource={item?.identifier}>{item.name}</Alias>
        ) : (
          <Identifier avatar={true} styles={['highlight-both']} ellipsis={true}>
            {item.identifier}
          </Identifier>
        )
    },
    {
      key: 'owner',
      header: 'Owner',
      grow: true,
      minWidth: 120,
      priority: 2,
      cell: (item: DataContractsListItemData) => {
        const ownerId = ownerIdOf(item)
        const ownerName = ownerNameOf(item)
        if (ownerName) return <Alias avatarSource={ownerId}>{ownerName}</Alias>
        if (ownerId)
          return (
            <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
              {ownerId}
            </Identifier>
          )
        return <span>-</span>
      }
    },
    {
      key: 'system',
      header: 'System',
      minWidth: 72,
      align: 'center',
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
      key: 'withTokens',
      header: 'With tokens',
      minWidth: 108,
      align: 'center',
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
      key: 'documents',
      header: 'Documents',
      minWidth: 88,
      align: 'center',
      priority: 3,
      cell: (item: DataContractsListItemData) => (
        <ValueContainer
          colorScheme={(item?.documentsCount ?? 0) > 0 ? 'brand' : 'darkGray'}
          size={'xs'}
        >
          <BigNumber>{item?.documentsCount}</BigNumber>
        </ValueContainer>
      )
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 120,
      align: 'right',
      cell: (item: DataContractsListItemData) =>
        !item?.timestamp && item?.isSystem ? (
          <span>Genesis</span>
        ) : (
          <DateBlock timestamp={item?.timestamp} format="dateOnly" />
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
  leavingKeys
}: DataContractsListProps) {
  const columns = contractColumns()

  if (dataContracts === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'DataContractsList'}
      items={dataContracts}
      columns={columns}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={item => `/dataContract/${item?.identifier}`}
      rowKey={item => item?.identifier || ''}
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
      emptyMessage={'There are no data contracts created yet.'}
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
