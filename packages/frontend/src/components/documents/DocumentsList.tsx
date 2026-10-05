'use client'

import type { Document } from '../../types'
import { Badge } from '../ui/Badge'
import { Alias, Identifier, NotActive, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../util'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

interface DocumentsListProps {
  allowedFilters?: string[]
  toolbarTarget?: HTMLElement | null
  documentTypes?: string[]
  documents?: Document[]
  headerStyles?: string
  pagination?: {
    onPageChange?: (p: { selected: number }) => void
    pageCount?: number
    forcePage?: number
  } | null
  paging?: DataListProps['paging']
  loading?: boolean
  itemsCount?: number
  showDataContract?: boolean
  showAction?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  showGas?: boolean
}

export default function DocumentsList({
  documents = [],
  allowedFilters = ['type', 'revision', 'owner', 'timestamp'],
  documentTypes,
  toolbarTarget,
  headerStyles,
  pagination,
  paging,
  loading,
  itemsCount = 10,
  showDataContract = false,
  showAction = true,
  filterValues,
  onFilterChange,
  showGas = true
}: DocumentsListProps) {
  const router = useRouter()

  if (documents === undefined && !loading) return <ErrorMessageBlock />

  const columns = [
    {
      key: 'identifier',
      header: 'Identifier',
      grow: true,
      minWidth: 120,
      cell: (document: Document) =>
        document?.identifier ? (
          <Identifier ellipsis={true} styles={['highlight-both']}>
            {document?.identifier}
          </Identifier>
        ) : (
          <NotActive />
        )
    },
    ...(showAction
      ? [
          {
            key: 'action',
            header: 'Action',
            minWidth: 100,
            priority: 2,
            cell: (document: Document) =>
              document?.transitionType ? (
                <BatchTypeBadge batchType={document.transitionType} />
              ) : (
                <NotActive />
              )
          }
        ]
      : []),
    {
      key: 'type',
      filterKey:
        onFilterChange &&
        (documentTypes?.length !== 1 ||
          (Array.isArray(filterValues?.type) && filterValues.type.length > 0))
          ? 'type'
          : undefined,
      filterType: documentTypes?.length ? ('options' as const) : ('search' as const),
      filterOptions: documentTypes?.map(value => ({ value, label: value })),
      filterMultiple: false,
      filterPlaceholder: 'Document type',
      header: 'Type',
      minWidth: 88,
      priority: 3,
      cell: (document: Document) => document?.documentTypeName ?? <NotActive />
    },
    {
      key: 'revision',
      filterKey: onFilterChange ? 'revision' : undefined,
      filterType: 'range' as const,
      numeric: true,
      header: 'Rev',
      minWidth: 48,
      align: 'center',
      priority: 1,
      cell: (document: Document) => document?.revision ?? <NotActive />
    },
    {
      key: 'ownerOrContract',
      filterKey: onFilterChange && !showDataContract ? 'owner' : undefined,
      filterType: 'search' as const,
      filterPlaceholder: 'Owner ID',
      header: showDataContract ? 'Data Contract' : 'Owner',
      grow: true,
      minWidth: 120,
      priority: 2,
      cell: (document: Document) => {
        if (showDataContract) {
          return document?.dataContractIdentifier ? (
            <LinkContainer
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/dataContract/${document?.dataContractIdentifier}`)
              }}
            >
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {document?.dataContractIdentifier}
              </Identifier>
            </LinkContainer>
          ) : (
            <NotActive />
          )
        }
        const activeAlias = findActiveAlias(document?.owner?.aliases)
        return document?.owner ? (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${document?.owner?.identifier}`)
            }}
          >
            {activeAlias ? (
              <Alias avatarSource={document?.owner?.identifier || null}>{activeAlias?.alias}</Alias>
            ) : (
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {document?.owner?.identifier}
              </Identifier>
            )}
          </LinkContainer>
        ) : (
          <NotActive />
        )
      }
    },
    ...(showGas
      ? [
          {
            key: 'gas',
            numeric: true,
            header: 'Gas',
            minWidth: 72,
            align: 'right',
            priority: 1,
            cell: (document: Document) =>
              typeof document?.gasUsed === 'number' && Number.isFinite(document.gasUsed) ? (
                document.gasUsed.toLocaleString()
              ) : (
                <NotActive />
              )
          }
        ]
      : []),
    {
      key: 'status',
      filterKey: onFilterChange ? 'status' : undefined,
      filterType: 'options' as const,
      filterOptions: [
        { value: 'active', label: 'Active' },
        { value: 'deleted', label: 'Deleted' }
      ],
      filterMultiple: false,
      header: 'Status',
      minWidth: 80,
      align: 'center',
      cell: (document: Document) =>
        document?.deleted ? (
          <Badge colorScheme={'red'}>Deleted</Badge>
        ) : (
          <Badge colorScheme={'green'}>Active</Badge>
        )
    },
    {
      key: 'timestamp',
      filterKey: onFilterChange ? 'timestamp' : undefined,
      filterType: 'daterange' as const,
      header: 'Timestamp',
      minWidth: 128,
      align: 'right',
      cell: (document: Document) => <TimeDelta endDate={document?.timestamp} />
    }
  ]

  return (
    <DataList
      className={'DocumentsList'}
      items={documents || []}
      columns={columns.map(column =>
        'filterKey' in column && !allowedFilters.includes(column.filterKey ?? '')
          ? { ...column, filterKey: undefined }
          : column
      )}
      paging={paging}
      toolbarTarget={toolbarTarget}
      pinFirst
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={document => `/document/${document?.identifier}`}
      rowKey={document => document?.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues &&
        Object.values(filterValues).some(
          value =>
            value &&
            (typeof value !== 'object' ||
              Object.values(value).some(item => item != null && item !== ''))
        )
          ? 'No documents match these filters.'
          : 'There are no documents created yet.'
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
