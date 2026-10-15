'use client'

import { useEffect, useState } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
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
  withdrawalsCount?: number | null
  loading: boolean
  error: boolean
  rate?: Rate | null
  defaultPayoutAddress?: string | null
  l1explorerBaseUrl?: string | null
}

function TabCount({ value }: { value?: number | string | null }) {
  const count = Number(value)
  if (value == null || !Number.isFinite(count)) return null
  return <span className={'Tabs__TabItemsCount'}>{Math.max(0, count).toLocaleString('en-US')}</span>
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
      if (kind === 'blocks')
        return Api.getBlocksByValidator(resourceId!, pageParam, pageSize, 'desc')
      if (kind === 'transactions')
        return Api.getTransactionsByIdentity(resourceId!, pageParam, pageSize, 'desc')
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
  const failed = (kind !== 'blocks' && props.error) || query.isError
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
          <span>Unable to load {kind}.</span>
          {resourceId && (
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          )}
        </div>
      )}
      {kind === 'blocks' ? (
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
  error,
  mode,
  onModeChange
}: Pick<ActivityProps, 'votingIdentity' | 'loading' | 'error'> & {
  active: boolean
  mode: ListScrollMode
  onModeChange: (mode: ListScrollMode) => void
}) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const query = useInfiniteQuery({
    queryKey: ['validator-votes', votingIdentity, mode, pageSize, mode === 'pages' ? page : 0],
    initialPageParam: mode === 'pages' ? page + 1 : 1,
    queryFn: ({ pageParam }) =>
      Api.getMasternodeVotes(pageParam, pageSize, 'desc', {
        voter_identity: votingIdentity as string
      }),
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
  const failed = error || query.isError

  return (
    <div className={'ValidatorPage__ActivityList'}>
      {failed && (
        <div role={'status'} className={'ValidatorPage__ActivityError'}>
          <span>Unable to load votes.</span>
          {votingIdentity && (
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          )}
        </div>
      )}
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
    </div>
  )
}

const LIST_MODE_KEY = 'validator-activity'

export default function ValidatorActivityLists(props: ActivityProps) {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<ListScrollMode>('continuous')
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
  useEffect(() => {
    setMode(readListScrollMode(LIST_MODE_KEY))
  }, [])
  const changeMode = (next: ListScrollMode) => {
    writeListScrollMode(LIST_MODE_KEY, next)
    setMode(next)
  }
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#withdrawals') setActive(2)
      if (window.location.hash === '#votes') setActive(3)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])
  return (
    <Tabs preserveScroll id={'withdrawals'} index={active} onChange={setActive}>
      <div className={'Tabs__Toolbar'}>
        <TabList>
          <Tab>
            Proposed Blocks
            <TabCount value={props.blocksCount} />
          </Tab>
          <Tab>
            Transactions
            <TabCount value={transactionCount.data} />
          </Tab>
          <Tab>
            Withdrawals
            <TabCount value={props.withdrawalsCount} />
          </Tab>
          <Tab>
            Votes
            <TabCount value={voteCount.data} />
          </Tab>
        </TabList>
        <DataListModeSwitch mode={mode} onModeChange={changeMode} />
      </div>
      <TabPanels>
        {(['blocks', 'transactions', 'withdrawals'] as const).map((kind, index) => (
          <TabPanel key={kind}>
            <ActivityList
              key={`${props.hash}-${mode}`}
              {...props}
              kind={kind}
              active={active === index}
              mode={mode}
              onModeChange={changeMode}
            />
          </TabPanel>
        ))}
        <TabPanel>
          <VotesActivity
            key={`${props.votingIdentity}-${mode}`}
            votingIdentity={props.votingIdentity}
            active={active === 3}
            loading={props.loading}
            error={props.error}
            mode={mode}
            onModeChange={changeMode}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
