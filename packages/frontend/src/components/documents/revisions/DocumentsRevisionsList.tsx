'use client'
import type { Document } from '../../../types'
import { DataList } from '../../ui/lists'
import { Alias, Identifier, BigNumber, TimeDelta, NotActive } from '../../data'
import { LinkContainer } from '../../ui/containers'
import BatchTypeBadge from '../../transactions/BatchTypeBadge'
import Pagination from '../../pagination'
import { RateTooltip } from '../../ui/Tooltips'
import { findActiveAlias } from '../../../util'
import { useRouter } from 'next/navigation'
interface DocumentsRevisionsListProps {
  revisions?: Array<Record<string, unknown>>
  headerStyles?: string
  pagination?: {
    onPageChange?: (p: { selected: number }) => void
    pageCount?: number
    forcePage?: number
  } | null
  loading?: boolean
  itemsCount?: number
}

export default function DocumentsRevisionsList({
  revisions = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}: DocumentsRevisionsListProps) {
  const router = useRouter()
  const items = revisions as unknown as (Document & { txHash?: string })[]
  return (
    <DataList
      items={items}
      loading={loading}
      skeletonCount={itemsCount}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      pinFirst
      rowKey={(item, index) => item.txHash ?? String(index)}
      rowHref={item => (item.txHash ? `/transaction/${item.txHash}` : undefined)}
      emptyMessage="There are no documents created yet."
      columns={[
        {
          key: 'hash',
          header: 'Tx Hash',
          minWidth: 180,
          grow: true,
          cell: item =>
            item.txHash ? <Identifier ellipsis>{item.txHash}</Identifier> : <NotActive />
        },
        {
          key: 'owner',
          header: 'Owner',
          minWidth: 180,
          grow: true,
          cell: item => {
            const alias = findActiveAlias(item.owner?.aliases)
            return item.owner?.identifier ? (
              <LinkContainer
                onClick={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  router.push(`/identity/${item.owner?.identifier}`)
                }}
              >
                {alias ? (
                  <Alias avatarSource={item.owner.identifier}>{alias.alias}</Alias>
                ) : (
                  <Identifier ellipsis avatar>
                    {item.owner.identifier}
                  </Identifier>
                )}
              </LinkContainer>
            ) : (
              <NotActive />
            )
          }
        },
        {
          key: 'gas',
          header: 'Gas Used',
          minWidth: 100,
          numeric: true,
          cell: item =>
            item.gasUsed != null ? (
              <RateTooltip credits={item.gasUsed}>
                <span>
                  <BigNumber>{item.gasUsed}</BigNumber>
                </span>
              </RateTooltip>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'type',
          header: 'Transition',
          minWidth: 140,
          cell: item =>
            item.transitionType != null ? (
              <BatchTypeBadge batchType={item.transitionType} />
            ) : (
              <NotActive />
            )
        },
        {
          key: 'revision',
          header: 'Revision',
          minWidth: 80,
          numeric: true,
          cell: item => item.revision ?? <NotActive />
        },
        {
          key: 'timestamp',
          header: 'Timestamp',
          minWidth: 128,
          align: 'right',
          cell: item => (item.timestamp ? <TimeDelta endDate={item.timestamp} /> : <NotActive />)
        }
      ]}
      footer={
        pagination ? (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount ?? 0}
            forcePage={pagination.forcePage ?? 0}
            justify
          />
        ) : undefined
      }
    />
  )
}
