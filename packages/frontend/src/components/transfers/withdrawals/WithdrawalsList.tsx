'use client'

import { useRouter } from 'next/navigation'
import { DataList } from '../../ui/lists'
import type { DataListColumn, DataListProps } from '../../ui/lists/DataList/DataList'
import { Identifier, BigNumber, TimeDelta, NotActive } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { RateTooltip } from '../../ui/Tooltips'
import StatusIcon from './StatusIcon'
import type { Rate, Withdrawal } from '../../../types'

const WITHDRAWAL_CONTRACT_ID = '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6'

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
  const router = useRouter()
  const columns: DataListColumn<Withdrawal>[] = [
    {
      key: 'hash',
      header: 'Tx hash',
      grow: true,
      minWidth: 160,
      cell: withdrawal =>
        withdrawal.hash ? (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/transaction/${withdrawal.hash}`)
            }}
          >
            <Identifier ellipsis={true} copyButton={true}>
              {withdrawal.hash}
            </Identifier>
          </LinkContainer>
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
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              window.open(
                `${l1explorerBaseUrl}/address/${address}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
          >
            {identifier}
          </LinkContainer>
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
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(
                `/document/${withdrawal.document}?document-type-name=withdrawal&contract-id=${WITHDRAWAL_CONTRACT_ID}`
              )
            }}
          >
            <Identifier ellipsis={true} copyButton={true}>
              {withdrawal.document}
            </Identifier>
          </LinkContainer>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 128,
      align: 'right',
      cell: withdrawal =>
        withdrawal.timestamp ? (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(withdrawal.timestamp)} />
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
      rowHref={withdrawal => (withdrawal.hash ? `/transaction/${withdrawal.hash}` : undefined)}
      emptyMessage={'There are no withdrawals yet.'}
    />
  )
}

export default WithdrawalsList
