'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { PaginatedResultSet } from '../../../types'
import type { DataListPagingConfig } from '../../../components/ui/lists/DataList/DataListPaging'
import {
  readListScrollMode,
  writeListScrollMode,
  type ListScrollMode
} from '../../../components/ui/lists/DataList/listScrollMode'

export function useIdentityList<T>(
  name: string,
  identifier: string,
  active: boolean,
  filters: object,
  fetchPage: (page: number, size: number) => Promise<PaginatedResultSet<T>>
) {
  const [mode, setMode] = useState<ListScrollMode>('continuous')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const storageKey = `identity-${name}`
  useEffect(() => setMode(readListScrollMode(storageKey)), [storageKey])
  const query = useInfiniteQuery({
    queryKey: ['identityList', name, identifier, mode, page, pageSize, filters],
    initialPageParam: page,
    queryFn: ({ pageParam }) => fetchPage(pageParam, pageSize),
    enabled: !!identifier,
    getNextPageParam: (last, _pages, lastPage) =>
      last.resultSet.length === pageSize && lastPage * pageSize < (last.pagination?.total ?? 0)
        ? lastPage + 1
        : undefined
  })
  const resetPage = useCallback(() => setPage(1), [])
  useEffect(() => {
    if (identifier) resetPage()
  }, [identifier, resetPage])
  const rawTotal = query.data?.pages[0]?.pagination?.total
  const total = rawTotal == null ? undefined : Math.max(0, rawTotal)
  const paging: DataListPagingConfig = {
    mode,
    onModeChange: next => {
      writeListScrollMode(storageKey, next)
      setMode(next)
      setPage(1)
    },
    hideModeSwitch: true,
    total: total ?? 0,
    page: page - 1,
    pageSize,
    onPageChange: next => setPage(next + 1),
    onPageSizeChange: next => {
      setPageSize(next)
      setPage(1)
    },
    onLoadMore: () => {
      if (!query.isFetching) void query.fetchNextPage()
    },
    loadingMore: query.isFetching && !query.isLoading,
    hasMore: active && query.hasNextPage && !query.isFetchNextPageError
  }
  return {
    query,
    total,
    items: query.data?.pages.flatMap(result => result.resultSet),
    paging,
    resetPage
  }
}
