'use client'
import Link from 'next/link'
import type { Owner } from '../../../types'

export interface TokenActivity {
  stateTransitionHash?: string | null
  status?: string | null
  error?: string | null
  timestamp?: string | Date | null
  owner?: Owner | null
  recipient?: string | null
  amount?: string | number | null
  action?: string | null
}
import { DataList } from '../../ui/lists'
import { Identifier, NotActive, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { Tooltip } from '../../ui/Tooltips'
import StatusIcon from '../../transactions/StatusIcon'
import BatchTypeBadge from '../../transactions/BatchTypeBadge'
import { FormattedNumber } from '../../ui/FormattedNumber'
import Pagination from '../../pagination'
import { useRouter } from 'next/navigation'
import type { Rate } from '../../../types'
type HeaderStyles = 'default' | 'light'

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface ActivityListProps {
  activities?: TokenActivity[]
  showMoreLink?: string
  headerStyles?: HeaderStyles
  rate?: Pick<Rate, 'usd'> | null
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
  decimals?: number | null
}

export default function ActivityList({
  activities = [],
  showMoreLink,
  headerStyles = 'default',
  pagination,
  loading,
  itemsCount = 10,
  decimals
}: ActivityListProps) {
  const router = useRouter()
  const identity = (identifier?: string | null) =>
    identifier ? (
      <LinkContainer
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
          router.push(`/identity/${identifier}`)
        }}
      >
        <Identifier avatar ellipsis>
          {identifier}
        </Identifier>
      </LinkContainer>
    ) : (
      <NotActive />
    )
  return (
    <DataList
      items={activities}
      loading={loading}
      skeletonCount={itemsCount}
      headerVariant={headerStyles}
      pinFirst
      rowKey={(item, index) => `${item.stateTransitionHash}-${index}`}
      rowHref={item =>
        item.stateTransitionHash ? `/transaction/${item.stateTransitionHash}` : undefined
      }
      emptyMessage="There are no activities yet."
      columns={[
        {
          key: 'hash',
          header: 'Hash',
          minWidth: 180,
          grow: true,
          cell: item =>
            item.stateTransitionHash ? (
              <Identifier ellipsis>{item.stateTransitionHash}</Identifier>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'owner',
          header: 'Owner',
          minWidth: 160,
          grow: true,
          cell: item => identity(item.owner?.identifier)
        },
        {
          key: 'recipient',
          header: 'Recipient',
          minWidth: 160,
          grow: true,
          cell: item => identity(item.recipient)
        },
        {
          key: 'amount',
          header: 'Amount (Tokens)',
          minWidth: 120,
          numeric: true,
          cell: item => (
            <FormattedNumber decimals={decimals ?? undefined}>{item.amount}</FormattedNumber>
          )
        },
        {
          key: 'type',
          header: 'Type',
          minWidth: 140,
          cell: item =>
            item.action != null ? <BatchTypeBadge batchType={item.action} /> : <NotActive />
        },
        {
          key: 'timestamp',
          header: 'Timestamp',
          minWidth: 150,
          align: 'right',
          cell: item => (
            <span className="DataList__Entity">
              {item.status && (
                <Tooltip title={item.status} content={item.error || ''} placement="top">
                  <span>
                    <StatusIcon status={item.status} w="1.125rem" h="1.125rem" mr="0.5rem" />
                  </span>
                </Tooltip>
              )}
              <TimeDelta endDate={item.timestamp} />
            </span>
          )
        }
      ]}
      footer={
        <>
          {pagination && <Pagination {...pagination} justify />}
          {showMoreLink && (
            <Link href={showMoreLink} className="SimpleList__ShowMoreButton">
              Show more
            </Link>
          )}
        </>
      }
    />
  )
}
