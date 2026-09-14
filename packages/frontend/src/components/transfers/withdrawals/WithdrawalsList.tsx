'use client'

import Link from 'next/link'
import { DataList } from '../../ui/lists'
import type { DataListColumn, DataListProps } from '../../ui/lists/DataList/DataList'
import { Identifier, BigNumber, DateBlock, NotActive } from '../../data'
import { RateTooltip } from '../../ui/Tooltips'
import StatusIcon from './StatusIcon'
import type { Rate, Withdrawal } from '../../../types'

interface WithdrawalsListProps {
  withdrawals?: Withdrawal[]
  headerStyles?: 'default' | 'light'
  defaultPayoutAddress?: string | null
  rate?: Pick<Rate, 'usd'> | null
  l1explorerBaseUrl?: string | null
  loading?: boolean
  skeletonCount?: number
  paging?: DataListProps['paging']
}

function WithdrawalsList({
  withdrawals = [],
  headerStyles = 'default',
  defaultPayoutAddress,
  rate,
  l1explorerBaseUrl,
  loading,
  skeletonCount,
  paging
}: WithdrawalsListProps) {
  const columns: DataListColumn<Withdrawal>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 148,
      cell: withdrawal =>
        withdrawal.timestamp ? (
          <DateBlock
            timestamp={withdrawal.timestamp}
            format={'dateOnly'}
            showTime={true}
            showRelativeTooltip={true}
          />
        ) : (
          <NotActive />
        )
    },
    {
      key: 'hash',
      header: 'Tx hash',
      grow: true,
      minWidth: 160,
      cell: withdrawal =>
        withdrawal.hash ? (
          <Link href={`/transaction/${withdrawal.hash}`}>
            <Identifier ellipsis={true} copyButton={true}>
              {withdrawal.hash}
            </Identifier>
          </Link>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'address',
      header: 'Address',
      grow: true,
      minWidth: 160,
      cell: withdrawal => {
        const address = withdrawal.withdrawalAddress || defaultPayoutAddress
        if (!address) return <NotActive />
        const identifier = (
          <Identifier ellipsis={true} copyButton={true}>
            {address}
          </Identifier>
        )
        return l1explorerBaseUrl ? (
          <a
            href={`${l1explorerBaseUrl}/address/${address}`}
            target={'_blank'}
            rel={'noopener noreferrer'}
          >
            {identifier}
          </a>
        ) : (
          identifier
        )
      }
    },
    {
      key: 'document',
      header: 'Document',
      grow: true,
      minWidth: 160,
      cell: withdrawal =>
        withdrawal.document ? (
          <Link
            href={`/document/${withdrawal.document}?document-type-name=withdrawal&contract-id=4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6`}
          >
            <Identifier ellipsis={true} copyButton={true}>
              {withdrawal.document}
            </Identifier>
          </Link>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      minWidth: 100,
      cell: withdrawal =>
        withdrawal.amount != null ? (
          <RateTooltip credits={Number(withdrawal.amount)} rate={rate}>
            <span>
              <BigNumber>{withdrawal.amount}</BigNumber>
            </span>
          </RateTooltip>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      cell: withdrawal =>
        withdrawal.status ? (
          <span className={'DataList__Entity'}>
            <StatusIcon status={withdrawal.status} w={'18px'} h={'18px'} />
            {withdrawal.status.toLowerCase()}
          </span>
        ) : (
          <NotActive />
        )
    }
  ]
  return (
    <DataList
      items={withdrawals}
      columns={columns}
      rowKey={(withdrawal, index) =>
        withdrawal.document ?? withdrawal.id ?? withdrawal.hash ?? index ?? 0
      }
      headerVariant={headerStyles}
      loading={loading}
      skeletonCount={skeletonCount}
      paging={paging}
      pinFirst={true}
      emptyMessage={'There are no withdrawals yet.'}
    />
  )
}

export default WithdrawalsList
