'use client'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { BigNumber, Identifier, NotActive, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import { RateTooltip } from '../ui/Tooltips'
import Pagination from '../pagination'
import TypeBadge from './TypeBadge'
import { useRouter } from 'next/navigation'
import type { Transfer } from '../../types'
type HeaderStyles = 'default' | 'light'

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface TransfersListProps {
  paging?: DataListProps['paging']
  toolbarTarget?: HTMLElement | null
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  transfers?: Transfer[]
  pagination?: ListPagination
  headerStyles?: HeaderStyles
  loading?: boolean
  itemsCount?: number
}

export default function TransfersList({
  transfers = [],
  paging,
  toolbarTarget,
  filterValues,
  onFilterChange,
  pagination,
  headerStyles,
  loading,
  itemsCount = 10
}: TransfersListProps) {
  const router = useRouter()
  return (
    <DataList
      items={transfers}
      paging={paging}
      toolbarTarget={toolbarTarget}
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      loading={loading}
      skeletonCount={itemsCount}
      headerVariant={headerStyles}
      pinFirst
      rowKey={(item, index) => `${item.txHash}-${index}`}
      rowHref={item => (item.txHash ? `/transaction/${item.txHash}` : undefined)}
      emptyMessage="There are no transfers yet."
      columns={[
        {
          key: 'hash',
          filterKey: onFilterChange ? 'hash' : undefined,
          filterType: 'search' as const,
          filterPlaceholder: 'Transaction Hash',
          header: 'Tx Hash',
          minWidth: 180,
          grow: true,
          cell: item =>
            item.txHash ? <Identifier ellipsis>{item.txHash}</Identifier> : <NotActive />
        },
        {
          key: 'recipient',
          header: 'To',
          minWidth: 180,
          grow: true,
          cell: item =>
            item.recipient ? (
              <LinkContainer
                onClick={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  router.push(`/identity/${item.recipient}`)
                }}
              >
                <Identifier avatar ellipsis>
                  {item.recipient}
                </Identifier>
              </LinkContainer>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'amount',
          header: 'Amount',
          minWidth: 100,
          numeric: true,
          cell: item =>
            item.amount != null ? (
              <RateTooltip credits={item.amount}>
                <span>
                  <BigNumber>{item.amount}</BigNumber>
                </span>
              </RateTooltip>
            ) : (
              <NotActive />
            )
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
          filterKey: onFilterChange ? 'type' : undefined,
          filterType: 'options' as const,
          filterMultiple: false,
          filterOptions: [
            {
              value: '2',
              label: <TypeBadge type="IDENTITY_CREATE" />,
              searchText: 'Identity create'
            },
            {
              value: '3',
              label: <TypeBadge type="IDENTITY_TOP_UP" />,
              searchText: 'Credit Top Up'
            },
            {
              value: '7',
              label: <TypeBadge type="IDENTITY_CREDIT_TRANSFER" />,
              searchText: 'Credit Transfer'
            },
            {
              value: '6',
              label: <TypeBadge type="IDENTITY_CREDIT_WITHDRAWAL" />,
              searchText: 'Credit Withdrawal'
            }
          ],
          header: 'Type',
          minWidth: 120,
          cell: item => (item.type ? <TypeBadge type={item.type} /> : <NotActive />)
        },
        {
          key: 'timestamp',
          header: 'Timestamp',
          minWidth: 128,
          align: 'right',
          cell: item => (item.timestamp ? <TimeDelta endDate={item.timestamp} /> : <NotActive />)
        }
      ]}
      footer={pagination ? <Pagination {...pagination} justify /> : undefined}
    />
  )
}
