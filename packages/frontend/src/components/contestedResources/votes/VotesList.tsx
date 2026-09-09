'use client'

import type { ReactNode, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Alias, Identifier, NotActive, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { Badge } from '../../ui/Badge'
import { DataList } from '../../ui/lists'
import type { DataListProps } from '../../ui/lists/DataList/DataList'
import Pagination from '../../pagination'
import { ErrorMessageBlock } from '../../Errors'
import { findActiveAlias } from '../../../util'
import ChoiceBadge from '../ChoiceBadge'
import contestedResourcesUtil from '../../../util/contestedResources'
import type { Vote } from '../../../types'
import './VotesList.css'

const CHOICE_OPTIONS = [
  {
    value: '0',
    label: <ChoiceBadge choice={0} />,
    searchText: 'towards identity'
  },
  {
    value: '1',
    label: <ChoiceBadge choice={1} />,
    searchText: 'abstain'
  },
  {
    value: '2',
    label: <ChoiceBadge choice={2} />,
    searchText: 'lock'
  }
]

const POWER_OPTIONS = [
  {
    value: '1',
    label: <Badge colorScheme={'blue'}>x1</Badge>,
    searchText: '1 x1'
  },
  {
    value: '4',
    label: <Badge colorScheme={'green'}>x4</Badge>,
    searchText: '4 x4'
  }
]

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface VotesListProps {
  votes?: Vote[]
  headerStyles?: string
  pagination?: PaginationProps | null
  loading?: boolean
  itemsCount?: number
  showDataContract?: boolean
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  pinFirst?: boolean
}

function VotesList({
  votes = [],
  headerStyles = 'default',
  pagination,
  loading,
  showDataContract = true,
  filterValues,
  onFilterChange,
  paging,
  title,
  pinFirst = false
}: VotesListProps) {
  const router = useRouter()
  const canFilter = Boolean(onFilterChange)

  const columns = [
    {
      key: 'voter',
      header: 'Voter',
      filterKey: canFilter ? 'voter_identity' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Voter identity',
      grow: true,
      minWidth: 148,
      cell: (vote: Vote) =>
        vote?.proTxHash ? (
          <LinkContainer
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/validator/${vote.proTxHash?.toUpperCase()}`)
            }}
          >
            <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
              {vote.proTxHash.toUpperCase()}
            </Identifier>
          </LinkContainer>
        ) : vote?.voterIdentifier ? (
          <LinkContainer
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${vote.voterIdentifier}`)
            }}
          >
            <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
              {vote.voterIdentifier}
            </Identifier>
          </LinkContainer>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'choice',
      header: 'Choice',
      filterKey: canFilter ? 'choice' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: CHOICE_OPTIONS,
      minWidth: 148,
      cell: (vote: Vote) =>
        typeof vote?.choice === 'number' ? (
          <ChoiceBadge choice={vote.choice} />
        ) : (
          <NotActive />
        )
    },
    {
      key: 'document',
      header: 'Resource',
      grow: true,
      minWidth: 140,
      priority: 3,
      cell: (vote: Vote) => {
        const resourceLabel = contestedResourcesUtil.getResourceValue(vote?.indexValues)
        if (vote?.documentIdentifier) {
          return (
            <LinkContainer
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/document/${vote.documentIdentifier}`)
              }}
            >
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {vote.documentIdentifier}
              </Identifier>
            </LinkContainer>
          )
        }
        if (resourceLabel) {
          return <span className={'DataList__Entity'}>{resourceLabel}</span>
        }
        return <NotActive />
      }
    },
    {
      key: 'towards',
      header: 'Towards Identity',
      filterKey: canFilter ? 'towards_identity' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Identity ID',
      grow: true,
      minWidth: 148,
      priority: 1,
      cell: (vote: Vote) => {
        if (!vote?.towardsIdentity) return <NotActive />
        const alias = findActiveAlias(vote.identityAliases || [])
        return (
          <LinkContainer
            onClick={(e: MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${vote.towardsIdentity}`)
            }}
          >
            {alias ? (
              <Alias avatarSource={vote.towardsIdentity} alias={alias.alias} />
            ) : (
              <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                {vote.towardsIdentity}
              </Identifier>
            )}
          </LinkContainer>
        )
      }
    },
    {
      key: 'power',
      header: 'Power',
      filterKey: canFilter ? 'power' : undefined,
      filterType: canFilter ? ('options' as const) : undefined,
      filterOptions: POWER_OPTIONS,
      minWidth: 88,
      align: 'center',
      cell: (vote: Vote) =>
        typeof vote?.power === 'number' ? (
          <Badge colorScheme={vote.power > 1 ? 'green' : 'blue'}>x{vote.power}</Badge>
        ) : (
          <NotActive />
        )
    },
    ...(showDataContract
      ? [
          {
            key: 'contract',
            header: 'Contract ID',
            grow: true,
            minWidth: 140,
            priority: 2,
            cell: (vote: Vote) =>
              vote?.dataContractIdentifier ? (
                <LinkContainer
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    e.preventDefault()
                    router.push(`/dataContract/${vote.dataContractIdentifier}`)
                  }}
                >
                  <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>
                    {vote.dataContractIdentifier}
                  </Identifier>
                </LinkContainer>
              ) : (
                <NotActive />
              )
          }
        ]
      : []),
    {
      key: 'timestamp',
      header: 'Timestamp',
      filterKey: canFilter ? 'timestamp' : undefined,
      filterType: canFilter ? ('daterange' as const) : undefined,
      minWidth: 128,
      align: 'right',
      cell: (vote: Vote) =>
        vote?.timestamp ? (
          <TimeDelta showTimestampTooltip={true} endDate={new Date(vote.timestamp)} />
        ) : (
          <NotActive />
        )
    }
  ]

  if (votes === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'VotesList'}
      items={votes}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      rowHref={vote => (vote?.txHash ? `/transaction/${vote.txHash}` : undefined)}
      rowKey={(vote, index) => vote?.txHash || `${vote?.voterIdentifier}-${vote?.timestamp}-${index}`}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No votes match these filters.'
          : 'There are no votes yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      footer={
        pagination && (
          <Pagination
            className={'VotesList__Pagination'}
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

export default VotesList
