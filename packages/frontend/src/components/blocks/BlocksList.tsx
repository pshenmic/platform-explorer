'use client'

import { columnLayout } from './BlocksList.columns'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueries } from '@tanstack/react-query'
import { Badge } from '../ui/Badge'
import { Identifier, NotActive, TimeDelta, BigNumber, DateBlock } from '../data'
import { BlockIcon } from '../ui/icons'
import { LinkContainer } from '../ui/containers'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { RateTooltip, EpochTooltip } from '../ui/Tooltips'
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
  if (!Number.isFinite(t) || duration <= 0)
    return typeof epoch.number === 'number' ? epoch.number : null
  return epoch.number + Math.floor((t - start) / duration)
}

function BlocksList({
  blocks = [],
  headerStyles = 'default',
  absoluteDate,
  filterValues,
  onFilterChange,
  loading,
  skeletonCount,
  paging
}: {
  blocks?: any[]
  headerStyles?: string
  absoluteDate?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  loading?: boolean
  skeletonCount?: number
  paging?: DataListProps['paging']
}) {
  const router = useRouter()
  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => Api.getStatus(),
    enabled: blocks.length > 0,
    staleTime: 30_000
  })
  const currentEpoch = statusQuery.data?.epoch ?? null
  const rateQuery = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate(),
    enabled: blocks.length > 0,
    staleTime: 60_000
  })
  const rate = rateQuery.data ?? null

  const epochIndexes = useMemo(() => {
    const set = new Set<number>()
    for (const block of blocks) {
      const index = epochIndexForTimestamp(block?.header?.timestamp, currentEpoch)
      if (typeof index === 'number' && Number.isFinite(index)) set.add(index)
    }
    return [...set]
  }, [blocks, currentEpoch])

  const epochQueries = useQueries({
    queries: epochIndexes.map(index => ({
      queryKey: ['epoch', index],
      queryFn: () => Api.getEpoch(index),
      staleTime: 60_000
    }))
  })

  const epochByIndex = useMemo(() => {
    const map = new Map<number, Epoch>()
    epochQueries.forEach((query, i) => {
      const index = epochIndexes[i]
      const epoch = query.data?.epoch
      if (typeof index === 'number' && epoch) map.set(index, epoch)
    })
    return map
  }, [epochQueries, epochIndexes])

  const columns = [
    {
      ...columnLayout.height,
      filterKey: 'height',
      filterType: 'range' as const,
      cell: ({ header }: any) => (
        <span className={'DataList__Entity'}>
          <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.5rem'} />
          {header?.height ?? <NotActive>-</NotActive>}
        </span>
      )
    },
    {
      ...columnLayout.hash,
      filterKey: 'hash',
      filterType: 'search' as const,
      filterPlaceholder: 'Block Hash',
      cell: ({ header }: any) =>
        typeof header?.hash === 'string' ? (
          <Identifier ellipsis={true} copyButton={true}>
            {header.hash}
          </Identifier>
        ) : null
    },
    {
      ...columnLayout.epoch,
      filterKey: 'epoch_index',
      filterType: 'range' as const,
      cell: ({ header }: any) => {
        const index = epochIndexForTimestamp(header?.timestamp, currentEpoch)
        if (typeof index !== 'number' || !Number.isFinite(index)) return <NotActive />
        const epoch = epochByIndex.get(index)
        const label = <span>#{index}</span>
        return epoch ? <EpochTooltip epoch={epoch}>{label}</EpochTooltip> : label
      }
    },
    {
      ...columnLayout.validator,
      filterKey: 'validator',
      filterType: 'search' as const,
      filterPlaceholder: 'Validator Pro TX Hash',
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
      ...columnLayout.gas,
      filterKey: 'gas',
      filterType: 'range' as const,
      cell: ({ header }: any) =>
        typeof header?.totalGasUsed === 'number' || typeof header?.totalGasUsed === 'string' ? (
          <RateTooltip credits={Number(header.totalGasUsed)} rate={rate}>
            <span>
              <BigNumber>{header.totalGasUsed}</BigNumber>
            </span>
          </RateTooltip>
        ) : (
          <NotActive>-</NotActive>
        )
    },
    {
      ...columnLayout.txs,
      filterKey: 'tx_count',
      filterType: 'range' as const,
      cell: ({ txs }: any) => (typeof txs?.length === 'number' ? <Badge>{txs.length}</Badge> : null)
    },
    {
      ...columnLayout.timestamp,
      filterKey: 'timestamp',
      filterType: 'daterange' as const,
      minWidth: absoluteDate ? 148 : 128,
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
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No blocks match these filters.'
          : 'There are no blocks yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      loading={loading}
      skeletonCount={skeletonCount}
      title={'Blocks'}
      paging={paging}
    />
  )
}

export default BlocksList
