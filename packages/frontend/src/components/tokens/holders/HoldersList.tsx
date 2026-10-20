'use client'
import type { Alias as AliasModel } from '../../../types'

export interface TokenHolder {
  identifier?: string | null
  aliases?: AliasModel[] | null
  tokensAmount?: string | number | null
  dashAmount?: string | number | null
  lastActivity?: string | Date | null
}
import { DataList } from '../../ui/lists'
import { Alias, Identifier, BigNumber, TimeDelta, NotActive } from '../../data'
import Pagination from '../../pagination'
import { findActiveAlias } from '../../../util'
type HeaderStyles = 'default' | 'light'

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface HoldersListProps {
  holders?: TokenHolder[]
  headerStyles?: HeaderStyles
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
}

export default function HoldersList({
  holders = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}: HoldersListProps) {
  return (
    <DataList
      items={holders}
      loading={loading}
      skeletonCount={itemsCount}
      headerVariant={headerStyles}
      pinFirst
      rowKey={(item, index) => item.identifier ?? String(index)}
      rowHref={item => (item.identifier ? `/identity/${item.identifier}` : undefined)}
      emptyMessage="There are no holders yet."
      columns={[
        {
          key: 'holder',
          header: 'Holder',
          minWidth: 200,
          grow: true,
          cell: item => {
            const alias = findActiveAlias(item.aliases || [])
            return item.identifier ? (
              alias ? (
                <Alias avatarSource={item.identifier}>{alias.alias}</Alias>
              ) : (
                <Identifier ellipsis avatar>
                  {item.identifier}
                </Identifier>
              )
            ) : (
              <NotActive />
            )
          }
        },
        {
          key: 'tokens',
          header: 'Tokens',
          minWidth: 120,
          numeric: true,
          cell: item => <BigNumber>{item.tokensAmount}</BigNumber>
        },
        {
          key: 'dash',
          header: 'Dash',
          minWidth: 120,
          numeric: true,
          cell: item => <BigNumber>{item.dashAmount}</BigNumber>
        },
        {
          key: 'timestamp',
          header: 'Last Activity',
          minWidth: 128,
          align: 'right',
          cell: item => <TimeDelta endDate={item.lastActivity} />
        }
      ]}
      footer={pagination ? <Pagination {...pagination} justify /> : undefined}
    />
  )
}
