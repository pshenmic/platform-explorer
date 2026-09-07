'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '../ui/Badge'
import { Identifier, NotActive, TimeDelta, BigNumber, DateBlock } from '../data'
import { BlockIcon } from '../ui/icons'
import { LinkContainer } from '../ui/containers'
import { DataList } from '../ui/lists'
import * as Api from '../../util/Api'
import type { Epoch } from '../../types'
// retained until transfers/withdrawals/contested/votes migrate — they borrow
// .BlocksList__ColumnTitles--Light and .BlocksListItem__LinkContainer from here
import './BlocksList.css'
import './BlocksListItem.css'

function epochIndexForTimestamp(timestamp: string | undefined, epoch: Epoch | null | undefined) {
  if (!timestamp || !epoch || epoch.startTime == null || epoch.endTime == null) return null
  const t = new Date(timestamp).getTime()
  const start = Number(epoch.startTime)
  const end = Number(epoch.endTime)
  const duration = end - start
  if (!Number.isFinite(t) || duration <= 0) return typeof epoch.number === 'number' ? epoch.number : null
  return epoch.number + Math.floor((t - start) / duration)
}

function BlocksList({
  blocks = [],
  headerStyles = 'default',
  absoluteDate,
  filterValues,
  onFilterChange,
  loading
}: {
  blocks?: any[]
  headerStyles?: string
  absoluteDate?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  loading?: boolean
}) {
  const router = useRouter()
  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => Api.getStatus(),
    staleTime: 30_000
  })
  const currentEpoch = statusQuery.data?.epoch ?? null

  const columns = [
    {
      key: 'height',
      header: 'Height',
      filterKey: 'height',
      filterType: 'range' as const,
      minWidth: 108,
      cell: ({ header }: any) => (
        <>
          <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.5rem'} />
          {header?.height ?? <NotActive>-</NotActive>}
        </>
      )
    },
    {
      key: 'hash',
      header: 'Block Hash',
      filterKey: 'hash',
      filterType: 'search' as const,
      filterPlaceholder: 'Block Hash',
      grow: true,
      minWidth: 160,
      cell: ({ header }: any) =>
        typeof header?.hash === 'string' ? (
          <Identifier middleEllipsis={true} copyButton={true}>
            {header.hash}
          </Identifier>
        ) : null
    },
    {
      key: 'epoch',
      header: 'Epoch',
      filterKey: 'epoch_index',
      filterType: 'range' as const,
      minWidth: 88,
      align: 'center',
      cell: ({ header }: any) => {
        const index = epochIndexForTimestamp(header?.timestamp, currentEpoch)
        return typeof index === 'number' && Number.isFinite(index) ? (
          <span>#{index}</span>
        ) : (
          <NotActive />
        )
      }
    },
    {
      key: 'validator',
      header: 'Validator',
      filterKey: 'validator',
      filterType: 'search' as const,
      filterPlaceholder: 'Validator Pro TX Hash',
      grow: true,
      minWidth: 160,
      cell: ({ header }: any) =>
        header?.validator ? (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/validator/${header?.validator}`)
            }}
          >
            <Identifier avatar={true} ellipsis={true} copyButton={true}>
              {header.validator}
            </Identifier>
          </LinkContainer>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'gas',
      header: 'Gas',
      filterKey: 'gas',
      filterType: 'range' as const,
      minWidth: 88,
      align: 'center',
      cell: ({ header }: any) =>
        typeof header?.totalGasUsed === 'number' || typeof header?.totalGasUsed === 'string' ? (
          <BigNumber>{header.totalGasUsed}</BigNumber>
        ) : (
          <NotActive>-</NotActive>
        )
    },
    {
      key: 'txs',
      header: 'TX count',
      filterKey: 'tx_count',
      filterType: 'range' as const,
      minWidth: 96,
      align: 'center',
      cell: ({ txs }: any) => (typeof txs?.length === 'number' ? <Badge>{txs.length}</Badge> : null)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      filterKey: 'timestamp',
      filterType: 'daterange' as const,
      minWidth: absoluteDate ? 132 : 108,
      align: 'right',
      cell: ({ header }: any) => {
        if (!header?.timestamp) return <NotActive />
        return absoluteDate ? (
          <DateBlock
            format={'dateOnly'}
            showTime={true}
            timestamp={header.timestamp}
            showRelativeTooltip={true}
          />
        ) : (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(header.timestamp)} />
        )
      }
    }
  ]

  return (
    <DataList
      className={'BlocksList'}
      items={blocks}
      columns={columns}
      pinFirst={true}
      rowHref={({ header }) => `/block/${header?.hash}`}
      rowKey={({ header }) => header?.hash}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no blocks yet.'}
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      loading={loading}
    />
  )
}

export default BlocksList
