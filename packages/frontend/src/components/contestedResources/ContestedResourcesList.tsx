'use client'

import { columnLayout } from './ContestedResourcesList.columns'

import type { ReactNode, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Alias, Identifier, NotActive, TimeDelta } from '../data'
import { Tooltip } from '../ui/Tooltips'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { Badge } from '../ui/Badge'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import Pagination from '../pagination'
import { ErrorMessageBlock } from '../Errors'
import contestedResourcesUtil from '../../util/contestedResources'
import VoteBadges from './VoteBadges'
import ContendersBadge from './ContendersBadge'
import type { ContestedResourcesListItemData } from './ContestedResourcesListItem'
import './ContestedResourcesList.css'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

function endsTone(end: Date) {
  const ms = end.getTime() - Date.now()
  if (ms <= 0) return 'ended'
  if (ms < HOUR_MS) return 'critical'
  if (ms < DAY_MS) return 'soon'
  return 'ok'
}

function EndsInCell({ end }: { end: string | Date }) {
  const endDate = new Date(end)
  if (Number.isNaN(endDate.getTime())) return <NotActive />
  const tone = endsTone(endDate)
  const absolute = `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`

  if (tone === 'ended') {
    return (
      <Tooltip placement={'top'} content={absolute}>
        <span className={'EndsInCell EndsInCell--ended'}>Ended</span>
      </Tooltip>
    )
  }

  return (
    <span className={`EndsInCell EndsInCell--${tone}`}>
      <TimeDelta endDate={endDate} showTimestampTooltip={true} />
    </span>
  )
}

const STATUS_OPTIONS = [
  {
    value: 'false',
    label: <Badge colorScheme={'orange'}>Pending</Badge>,
    searchText: 'pending voting in progress'
  },
  {
    value: 'true',
    label: <Badge colorScheme={'gray'}>Finished</Badge>,
    searchText: 'finished voting ended'
  }
]

const DOCUMENT_TYPE_OPTIONS = [
  {
    value: 'domain',
    label: (
      <Badge colorScheme={'gray'} size={'xs'}>
        domain
      </Badge>
    ),
    searchText: 'domain dpns name'
  }
]

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface ContestedResourcesListProps {
  contestedResources?: ContestedResourcesListItemData[]
  headerStyles?: string
  pagination?: PaginationProps | null
  loading?: boolean
  itemsCount?: number
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  titleExtra?: ReactNode
  pinFirst?: boolean
}

function resourceHref(item: ContestedResourcesListItemData) {
  if (!item?.resourceValue) return undefined
  return `/contestedResource/${btoa(JSON.stringify(item.resourceValue))}`
}

function resourceKey(item: ContestedResourcesListItemData, index?: number) {
  if (item?.resourceValue) return JSON.stringify(item.resourceValue)
  return index ?? 0
}

function isEnded(item: ContestedResourcesListItemData) {
  if (!item?.endTimestamp) return false
  return new Date() > new Date(item.endTimestamp)
}

function ContestedResourcesList({
  contestedResources = [],
  headerStyles = 'default',
  pagination,
  loading,
  itemsCount,
  filterValues,
  onFilterChange,
  paging,
  title,
  titleExtra,
  pinFirst = false
}: ContestedResourcesListProps) {
  const router = useRouter()
  const canFilter = Boolean(onFilterChange)

  const columns = [
    {
      ...columnLayout.resourceValue,
      filterKey: canFilter ? 'resourceValue' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Name or encoded value',
      cell: (item: ContestedResourcesListItemData) => (
        <span className={'DataList__Entity'}>
          <Alias ellipsis={true}>
            {contestedResourcesUtil.getResourceValue(item?.resourceValue)}
          </Alias>
          {item?.contenders ? <ContendersBadge contenders={item.contenders} /> : null}
        </span>
      )
    },
    {
      ...columnLayout.status,
      filterKey: canFilter ? 'voting_finished' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: STATUS_OPTIONS,
      cell: (item: ContestedResourcesListItemData) =>
        isEnded(item) ? (
          <Badge colorScheme={'gray'}>Finished</Badge>
        ) : (
          <Badge colorScheme={'orange'}>Pending</Badge>
        )
    },
    {
      ...columnLayout.timestamp,
      filterKey: canFilter ? 'timestamp' : undefined,
      filterType: canFilter ? ('daterange' as const) : undefined,
      cell: (item: ContestedResourcesListItemData) =>
        item?.timestamp ? (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(item.timestamp)} />
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.contract,
      filterKey: canFilter ? 'contract' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Contract ID or name',
      priority: 1,
      cell: (item: ContestedResourcesListItemData) =>
        item?.dataContractIdentifier ? (
          <LinkContainer
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/dataContract/${item.dataContractIdentifier}`)
            }}
          >
            <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
              {item.dataContractIdentifier}
            </Identifier>
          </LinkContainer>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.indexName,
      priority: 3,
      cell: (item: ContestedResourcesListItemData) =>
        item?.indexName ? (
          <ValueContainer colorScheme={'gray'} size={'xxs'}>
            {item.indexName}
          </ValueContainer>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.documentType,
      filterKey: canFilter ? 'document_type_name' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: DOCUMENT_TYPE_OPTIONS,
      priority: 2,
      cell: (item: ContestedResourcesListItemData) =>
        item?.documentTypeName ? (
          <Badge colorScheme={'gray'} size={'xs'}>
            {item.documentTypeName}
          </Badge>
        ) : (
          <NotActive />
        )
    },
    {
      ...columnLayout.votes,

      cell: (item: ContestedResourcesListItemData) => (
        <VoteBadges
          totalCountAbstain={item?.totalCountAbstain}
          totalCountLock={item?.totalCountLock}
          totalCountTowardsIdentity={item?.totalCountTowardsIdentity}
        />
      )
    },
    {
      ...columnLayout.endsIn,

      cell: (item: ContestedResourcesListItemData) =>
        item?.endTimestamp ? <EndsInCell end={item.endTimestamp} /> : <NotActive />
    }
  ]

  if (contestedResources === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'ContestedResourcesList'}
      items={contestedResources}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      skeletonCount={itemsCount}
      rowHref={resourceHref}
      rowKey={resourceKey}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No contested resources match these filters.'
          : 'There are no contested resources yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      titleExtra={titleExtra}
      footer={
        pagination && (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount}
            forcePage={pagination.forcePage}
            justify={true}
          />
        )
      }
    />
  )
}

export default ContestedResourcesList
