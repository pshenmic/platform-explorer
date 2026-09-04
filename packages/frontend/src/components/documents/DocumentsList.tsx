'use client'

import type { Document } from '../../types'
import { Badge } from '../ui/Badge'
import { Alias, Identifier, NotActive, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { DataList } from '../ui/lists'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../util'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'

interface DocumentsListProps {
  documents?: Array<Document & { gasUsed?: number }>
  headerStyles?: string
  pagination?: {
    onPageChange?: (p: { selected: number }) => void
    pageCount?: number
    forcePage?: number
  } | null
  loading?: boolean
  itemsCount?: number
  showDataContract?: boolean
  showAction?: boolean
  showGas?: boolean
}

export default function DocumentsList({
  documents = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10,
  showDataContract = false,
  showAction = true,
  showGas = true
}: DocumentsListProps) {
  const router = useRouter()

  if (documents === undefined && !loading) return <ErrorMessageBlock />

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      minWidth: 88,
      cell: (document: Document & { gasUsed?: number }) => (
        <TimeDelta endDate={document?.timestamp} />
      )
    },
    ...(showAction
      ? [
          {
            key: 'action',
            header: 'Action',
            minWidth: 100,
            priority: 2,
            cell: (document: Document & { gasUsed?: number }) =>
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
      header: 'Type',
      minWidth: 88,
      priority: 3,
      cell: (document: Document & { gasUsed?: number }) =>
        document?.documentTypeName ?? <NotActive />
    },
    {
      key: 'revision',
      header: 'Rev',
      minWidth: 48,
      align: 'center',
      priority: 1,
      cell: (document: Document & { gasUsed?: number }) => document?.revision ?? <NotActive />
    },
    {
      key: 'identifier',
      header: 'Identifier',
      grow: true,
      minWidth: 120,
      cell: (document: Document & { gasUsed?: number }) =>
        document?.identifier ? (
          <Identifier ellipsis={true} styles={['highlight-both']}>
            {document?.identifier}
          </Identifier>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'ownerOrContract',
      header: showDataContract ? 'Data Contract' : 'Owner',
      grow: true,
      minWidth: 120,
      priority: 2,
      cell: (document: Document & { gasUsed?: number }) => {
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
            header: 'Gas',
            minWidth: 72,
            align: 'right',
            priority: 1,
            cell: (document: Document & { gasUsed?: number }) =>
              Number.isFinite(document?.gasUsed) ? (
                document.gasUsed.toLocaleString()
              ) : (
                <NotActive />
              )
          }
        ]
      : []),
    {
      key: 'status',
      header: 'Status',
      minWidth: 80,
      align: 'center',
      cell: (document: Document & { gasUsed?: number }) =>
        document?.deleted ? (
          <Badge colorScheme={'red'}>Deleted</Badge>
        ) : (
          <Badge colorScheme={'green'}>Active</Badge>
        )
    }
  ]

  return (
    <DataList
      className={'DocumentsList'}
      items={documents || []}
      columns={columns}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={document => `/document/${document?.identifier}`}
      rowKey={document => document?.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no documents created yet.'}
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
