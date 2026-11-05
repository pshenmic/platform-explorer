'use client'

import { useEffect, useState } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { formatNumberWithSpaces } from '../../../util/numbers'
import BlocksList from '../../../components/blocks/BlocksList'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { WithdrawalsList } from '../../../components/transfers'
import VotesList from '../../../components/contestedResources/votes/VotesList'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '../../../components/ui/Tabs'
import { DataListModeSwitch } from '../../../components/ui/lists/DataList/DataListPaging'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../../components/ui/lists/DataList/listScrollMode'
import type { DataListProps } from '../../../components/ui/lists/DataList/DataList'
import type { Block, Transaction, Withdrawal, Vote, Rate, PaginatedResultSet } from '../../../types'

type ListKind = 'blocks' | 'transactions' | 'withdrawals' | 'votes'
type ActivityItem = Block | Transaction | Withdrawal
interface ActivityProps {
  hash: string
  identity?: string | null
  votingIdentity?: string | null
  blocksCount?: number | null
  loading: boolean
  error: boolean
  rate?: Rate | null
  defaultPayoutAddress?: string | null
  l1explorerBaseUrl?: string | null
}

function TabCount({
  value,
  loading = false,
  error = false
}: {
  value?: number | string | null
  loading?: boolean
  error?: boolean
}) {
  const count = Number(value)
  const known = value != null && Number.isFinite(count)
  const state = loading ? 'loading' : error ? 'error' : known ? 'ready' : 'unknown'
  const label = loading
    ? 'Loading count'
    : error
      ? 'Could not load count'
      : known
        ? undefined
        : 'Count unavailable'
  return (
    <span className="Tabs__TabItemsCount" data-state={state} title={label} aria-label={label}>
      {loading ? '…' : error ? 'Error' : known ? formatNumberWithSpaces(Math.max(0, count)) : '—'}
    </span>
  )
}

function ActivityList({
  kind,
  active,
  mode,
  onModeChange,
  ...props
}: ActivityProps & {
  kind: Exclude<ListKind, 'votes'>
  active: boolean
  mode: ListScrollMode
  onModeChange: (mode: ListScrollMode) => void
}) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const queryClient = useQueryClient()
  const resourceId = kind === 'blocks' ? props.hash : props.identity
  const query = useInfiniteQuery({
    queryKey: ['validator-activity', kind, resourceId, mode, pageSize, mode === 'pages' ? page : 0],
    initialPageParam: mode === 'pages' ? page + 1 : 1,
    queryFn: async ({ pageParam }): Promise<PaginatedResultSet<ActivityItem>> => {
      if (kind === 'blocks') {
        const result = await Api.getBlocksByValidator(resourceId!, pageParam, pageSize, 'desc')
        queryClient.setQueryData(
          ['validator-block-total', resourceId],
          Math.max(0, result.pagination.total)
        )
        return result
      }
      if (kind === 'transactions') {
        const result = await Api.getTransactionsByIdentity(resourceId!, pageParam, pageSize, 'desc')
        queryClient.setQueryData(
          ['validator-tx-total', resourceId],
          Math.max(0, result.pagination.total)
        )
        return result
      }
      const result = await queryClient.fetchQuery({
        queryKey: ['identity-withdrawals', resourceId],
        queryFn: () => Api.getWithdrawalsByIdentity(resourceId!, 1, 100, 'desc'),
        staleTime: 60000
      })
      return {
        resultSet: result.resultSet.slice((pageParam - 1) * pageSize, pageParam * pageSize),
        pagination: { page: pageParam, limit: pageSize, total: result.resultSet.length }
      }
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, result) => sum + result.resultSet.length, 0)
      return last.resultSet.length && loaded < last.pagination.total ? pages.length + 1 : undefined
    },
    enabled: active && Boolean(resourceId),
    staleTime: 60000,
    retry: 1
  })
  const rows = query.data?.pages.flatMap(result => result.resultSet) ?? []
  const keyFor = (item: ActivityItem) =>
    'header' in item
      ? (item as Block).header.hash
      : 'document' in item && item.document
        ? item.document
        : 'id' in item
          ? (item.id ?? item.hash)
          : item.hash
  const items = [...new Map(rows.map((item, index) => [keyFor(item) ?? index, item])).values()]
  const total = Math.max(0, query.data?.pages[0]?.pagination.total ?? 0)
  const loading = props.loading || (Boolean(resourceId) && query.isPending)
  const unavailable = !props.loading && !resourceId
  const failed = query.isError || unavailable
  const paging: DataListProps['paging'] = {
    scrollTarget: 'container',
    mode,
    hideModeSwitch: true,
    onModeChange: next => {
      onModeChange(next)
      setPage(0)
    },
    total,
    pageSize,
    page,
    onPageChange: setPage,
    onPageSizeChange: size => {
      setPageSize(size)
      setPage(0)
    },
    onLoadMore: () => {
      if (active && query.hasNextPage && !query.isFetching) void query.fetchNextPage()
    },
    loadingMore: query.isFetchingNextPage,
    hasMore: active && !failed && Boolean(query.hasNextPage)
  }
  return (
    <div className={'ValidatorPage__ActivityList'}>
      {failed && (
        <div role={'status'} className={'ValidatorPage__ActivityError'}>
          <span>{unavailable ? 'Platform identity unavailable' : `Unable to load ${kind}.`}</span>
          {resourceId && (
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          )}
        </div>
      )}
      {failed && items.length === 0 ? null : kind === 'blocks' ? (
        <BlocksList
          blocks={items as Block[]}
          title={null}
          loading={loading}
          skeletonCount={pageSize}
          showValidator={false}
          showGas={false}
          paging={paging}
        />
      ) : kind === 'transactions' ? (
        <TransactionsList
          compactStatus
          transactions={items as Transaction[]}
          loading={loading}
          skeletonCount={pageSize}
          rate={props.rate}
          pinFirst={true}
          showOwner={false}
          paging={paging}
        />
      ) : (
        <WithdrawalsList
          compactStatus
          amountUnit="dash"
          withdrawals={items as Withdrawal[]}
          loading={loading}
          skeletonCount={pageSize}
          rate={props.rate}
          defaultPayoutAddress={props.defaultPayoutAddress}
          l1explorerBaseUrl={props.l1explorerBaseUrl}
          paging={paging}
        />
      )}
    </div>
  )
}

function voteTotal(identity: string) {
  return Api.getMasternodeVotes(1, 1, 'desc', { voter_identity: identity }).then(result =>
    Math.max(0, result.pagination.total)
  )
}

function VotesActivity({
  votingIdentity,
  active,
  loading,
  mode,
  onModeChange
}: Pick<ActivityProps, 'votingIdentity' | 'loading'> & {
  active: boolean
  mode: ListScrollMode
  onModeChange: (mode: ListScrollMode) => void
}) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const queryClient = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: ['validator-votes', votingIdentity, mode, pageSize, mode === 'pages' ? page : 0],
    initialPageParam: mode === 'pages' ? page + 1 : 1,
    queryFn: async ({ pageParam }) => {
      const result = await Api.getMasternodeVotes(pageParam, pageSize, 'desc', {
        voter_identity: votingIdentity as string
      })
      queryClient.setQueryData(
        ['validator-vote-total', votingIdentity],
        Math.max(0, result.pagination.total)
      )
      return result
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, result) => sum + result.resultSet.length, 0)
      return last.resultSet.length && loaded < last.pagination.total ? pages.length + 1 : undefined
    },
    enabled: active && Boolean(votingIdentity),
    staleTime: 60000,
    retry: 1
  })
  const rows = query.data?.pages.flatMap(result => result.resultSet) ?? []
  const items = [...new Map(rows.map((item, index) => [item.txHash ?? index, item])).values()]
  const total = Math.max(0, query.data?.pages[0]?.pagination.total ?? 0)
  const pending = loading || (Boolean(votingIdentity) && active && query.isPending)
  const unavailable = !loading && !votingIdentity
  const failed = query.isError || unavailable

  return (
    <div className={'ValidatorPage__ActivityList'}>
      {failed && (
        <div role={'status'} className={'ValidatorPage__ActivityError'}>
          <span>
            {unavailable ? 'Voting identity unavailable' : 'Unable to load masternode votes.'}
          </span>
          {votingIdentity && (
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          )}
        </div>
      )}
      {(!failed || items.length > 0) && (
        <VotesList
          votes={items as Vote[]}
          loading={pending}
          itemsCount={pageSize}
          showVoter={false}
          showDataContract={false}
          resourceFirst={true}
          blankMissing={true}
          pinFirst={true}
          paging={{
            scrollTarget: 'container',
            mode,
            hideModeSwitch: true,
            onModeChange: next => {
              onModeChange(next)
              setPage(0)
            },
            total,
            pageSize,
            page,
            onPageChange: setPage,
            onPageSizeChange: size => {
              setPageSize(size)
              setPage(0)
            },
            onLoadMore: () => {
              if (active && query.hasNextPage && !query.isFetching) void query.fetchNextPage()
            },
            loadingMore: query.isFetchingNextPage,
            hasMore: active && !failed && Boolean(query.hasNextPage)
          }}
        />
      )}
    </div>
  )
}

const LIST_MODE_KEY = 'validator-activity'
const ACTIVITY_ORDER = ['withdrawals', 'blocks', 'votes', 'transactions'] as const

export default function ValidatorActivityLists(props: ActivityProps) {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ListScrollMode>('continuous')
  const blockCount = useQuery({
    queryKey: ['validator-block-total', props.hash],
    enabled: false,
    queryFn: () =>
      Api.getBlocksByValidator(props.hash, 1, 1, 'desc').then(result =>
        Math.max(0, result.pagination.total)
      )
  })
  const voteCount = useQuery({
    queryKey: ['validator-vote-total', props.votingIdentity],
    enabled: Boolean(props.votingIdentity),
    staleTime: 60000,
    retry: 1,
    queryFn: () => voteTotal(props.votingIdentity as string)
  })
  const transactionCount = useQuery({
    queryKey: ['validator-tx-total', props.identity],
    enabled: Boolean(props.identity),
    staleTime: 60000,
    retry: 1,
    queryFn: () =>
      Api.getTransactionsByIdentity(props.identity as string, 1, 1, 'desc').then(result =>
        Math.max(0, result.pagination.total)
      )
  })
  const withdrawals = useQuery({
    queryKey: ['identity-withdrawals', props.identity],
    enabled: Boolean(props.identity),
    staleTime: 60000,
    retry: 1,
    queryFn: () => Api.getWithdrawalsByIdentity(props.identity as string, 1, 100, 'desc')
  })
  useEffect(() => {
    setMode(readListScrollMode(LIST_MODE_KEY))
  }, [])
  const changeMode = (next: ListScrollMode) => {
    writeListScrollMode(LIST_MODE_KEY, next)
    setMode(next)
  }
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#withdrawals') setActive(ACTIVITY_ORDER.indexOf('withdrawals'))
      if (window.location.hash === '#votes') setActive(ACTIVITY_ORDER.indexOf('votes'))
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])
  return (
    <Tabs preserveScroll id={'withdrawals'} index={active} onChange={setActive}>
      <div className={'Tabs__Toolbar'}>
        <TabList>
          <Tab title="Platform identity withdrawals to Core, including pending and expired requests">
            Withdrawals{' '}
            <TabCount
              value={withdrawals.data?.resultSet.length}
              loading={props.loading || (Boolean(props.identity) && withdrawals.isPending)}
              error={withdrawals.isError || (props.error && !props.identity)}
            />
          </Tab>
          <Tab title="Platform blocks proposed by this validator.">
            Proposed blocks{' '}
            <TabCount
              value={blockCount.data ?? props.blocksCount}
              loading={props.loading && blockCount.data == null}
              error={props.error && blockCount.data == null && props.blocksCount == null}
            />
          </Tab>
          <Tab title="Votes on Platform contested resources. Not Core governance votes.">
            Platform votes{' '}
            <TabCount
              value={voteCount.data}
              loading={props.loading || (Boolean(props.votingIdentity) && voteCount.isPending)}
              error={voteCount.isError || (props.error && !props.votingIdentity)}
            />
          </Tab>
          <Tab title="Transactions associated with this validator's Platform identity.">
            Transactions{' '}
            <TabCount
              value={transactionCount.data}
              loading={props.loading || (Boolean(props.identity) && transactionCount.isPending)}
              error={transactionCount.isError || (props.error && !props.identity)}
            />
          </Tab>
        </TabList>
        <DataListModeSwitch mode={mode} onModeChange={changeMode} />
      </div>
      <TabPanels>
        {ACTIVITY_ORDER.map((kind, index) => (
          <TabPanel key={kind}>
            {kind === 'votes' ? (
              <VotesActivity
                key={`${props.votingIdentity}-${mode}`}
                votingIdentity={props.votingIdentity}
                active={active === index}
                loading={props.loading}
                mode={mode}
                onModeChange={changeMode}
              />
            ) : (
              <ActivityList
                key={`${props.hash}-${mode}`}
                {...props}
                kind={kind}
                active={active === index}
                mode={mode}
                onModeChange={changeMode}
              />
            )}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}
