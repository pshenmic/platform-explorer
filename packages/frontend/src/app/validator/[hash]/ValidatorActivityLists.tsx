'use client'

import { useEffect, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import BlocksList from '../../../components/blocks/BlocksList'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { WithdrawalsList } from '../../../components/transfers'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '../../../components/ui/Tabs'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../../components/ui/lists/DataList/listScrollMode'
import type { DataListProps } from '../../../components/ui/lists/DataList/DataList'
import type { Block, Transaction, Withdrawal, Rate, PaginatedResultSet } from '../../../types'

type ListKind = 'blocks' | 'transactions' | 'withdrawals'
type ActivityItem = Block | Transaction | Withdrawal
interface ActivityProps {
  hash: string
  identity?: string | null
  loading: boolean
  error: boolean
  rate?: Rate | null
  defaultPayoutAddress?: string | null
  l1explorerBaseUrl?: string | null
}

function ActivityList({
  kind,
  active,
  ...props
}: ActivityProps & { kind: ListKind; active: boolean }) {
  const [mode, setMode] = useState<ListScrollMode>('continuous')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const queryClient = useQueryClient()
  const resourceId = kind === 'blocks' ? props.hash : props.identity
  useEffect(() => setMode(readListScrollMode(`validator-${kind}`)), [kind])
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
    onModeChange: next => {
      writeListScrollMode(`validator-${kind}`, next)
      setMode(next)
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
          absoluteDate={true}
          paging={paging}
        />
      ) : kind === 'transactions' ? (
        <TransactionsList
          transactions={items as Transaction[]}
          loading={loading}
          skeletonCount={pageSize}
          absoluteDate={true}
          rate={props.rate}
          pinFirst={true}
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

export default function ValidatorActivityLists(props: ActivityProps) {
  const [active, setActive] = useState(0)
  return (
    <Tabs index={active} onChange={setActive}>
      <TabList>
        <Tab>Proposed Blocks</Tab>
        <Tab>Transactions</Tab>
        <Tab>Withdrawals</Tab>
      </TabList>
      <TabPanels>
        {(['blocks', 'transactions', 'withdrawals'] as const).map((kind, index) => (
          <TabPanel key={kind}>
            <ActivityList {...props} kind={kind} active={active === index} />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}
