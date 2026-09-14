'use client'

import { columnLayout } from './ValidatorsList.columns'

import type { ReactNode } from 'react'
import type { Validator } from '../../types'
import { Identifier, NotActive, TimeDelta, BigNumber } from '../data'
import { BlockIcon } from '../ui/icons'
import { Badge } from '../ui/Badge'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { ErrorMessageBlock } from '../Errors'

const ACTIVE_OPTIONS = [
  {
    value: 'current',
    label: <Badge colorScheme={'orange'}>Current</Badge>,
    searchText: 'current active'
  },
  {
    value: 'queued',
    label: <Badge colorScheme={'gray'}>Queued</Badge>,
    searchText: 'queued inactive'
  }
]

export const ValidatorsListSceleton = ({ pageSize = 25 }: { pageSize?: number | string }) => (
  <DataList
    className={'ValidatorsList'}
    items={[]}
    columns={validatorColumns(false)}
    loading
    pinFirst={true}
    title={'Validators'}
    skeletonCount={Number(pageSize) || 25}
  />
)

interface ValidatorsListProps {
  loading?: boolean
  list?: Validator[]
  pageSize?: number | string
  error?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  pinFirst?: boolean
}

function validatorColumns(canFilter: boolean) {
  return [
    {
      ...columnLayout.identifier,
      filterKey: canFilter ? 'identifier' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'ProTxHash, identity or block hash',
      cell: (validator: Validator) =>
        validator?.proTxHash ? (
          <span className={'DataList__Entity'}>
            <Identifier avatar={true} copyButton={true} ellipsis={true}>
              {validator.proTxHash}
            </Identifier>
          </span>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.active,
      filterKey: canFilter ? 'isActive' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: ACTIVE_OPTIONS,
      cell: (validator: Validator) =>
        validator?.isActive != null ? (
          <Badge colorScheme={validator.isActive ? 'orange' : 'gray'}>
            {validator.isActive ? 'Current' : 'Queued'}
          </Badge>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.lastBlockHeight,
      filterKey: canFilter ? 'last_proposed_block_height' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      priority: 1,
      cell: (validator: Validator) => {
        const height = validator?.lastProposedBlockHeader?.height
        if (height == null) return <NotActive>—</NotActive>
        return (
          <span className={'DataList__Entity'}>
            <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.5rem'} />
            {height}
          </span>
        )
      }
    },
    {
      ...columnLayout.proposedBlocksAmount,
      filterKey: canFilter ? 'blocks_proposed' : undefined,
      filterType: canFilter ? ('range' as const) : undefined,
      priority: 1,
      cell: (validator: Validator) => {
        const n = Number(validator?.proposedBlocksAmount)
        if (!Number.isFinite(n)) return <NotActive>—</NotActive>
        return (
          <Badge colorScheme={n > 0 ? 'gray' : 'dimGray'} size={'xs'}>
            <BigNumber>{String(n)}</BigNumber>
          </Badge>
        )
      }
    },
    {
      ...columnLayout.timestamp,
      filterKey: canFilter ? 'timestamp' : undefined,
      filterType: canFilter ? ('daterange' as const) : undefined,
      cell: (validator: Validator) => {
        const ts = validator.lastProposedBlockHeader?.timestamp
        return ts ? <TimeDelta showTimestampTooltip={true} endDate={new Date(ts)} /> : <NotActive />
      }
    }
  ]
}

export const ValidatorsList = ({
  loading,
  list,
  pageSize,
  error,
  filterValues,
  onFilterChange,
  paging,
  title,
  pinFirst = false
}: ValidatorsListProps) => {
  const canFilter = Boolean(onFilterChange)

  if (error) {
    return (
      <div className={'ListPage__Error'}>
        <ErrorMessageBlock />
      </div>
    )
  }

  return (
    <DataList
      className={'ValidatorsList'}
      items={list || []}
      columns={validatorColumns(canFilter)}
      loading={loading}
      skeletonCount={Number(pageSize) || 25}
      pinFirst={pinFirst}
      rowHref={validator => `/validator/${validator.proTxHash}`}
      rowKey={validator => validator.proTxHash || ''}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No validators match these filters.'
          : 'There are no validators yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
    />
  )
}
