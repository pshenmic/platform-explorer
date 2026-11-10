'use client'

import { useEffect, useMemo } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { ResponseErrorNotFound } from '../../../util/Errors'
import { orderQuorums, quorumKey } from '../quorumModel'

const LIST_KEY = ['home', 'quorums', 'list'] as const
const REFRESH_MS = 60_000

function combineDetails(results: UseQueryResult<Api.PlatformQuorum, Error>[]) {
  // Query's structural sharing keeps data stable across loading/error-only changes.
  return { queries: results, data: results.map(result => result.data) }
}

export function useQuorumRoster(requestedHash: string | null, loadAllDetails: boolean) {
  const client = useQueryClient()
  const listQuery = useQuery({
    queryKey: LIST_KEY,
    queryFn: Api.getQuorums,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
    retry: 1
  })
  const sortedQuorums = useMemo(() => orderQuorums(listQuery.data ?? []), [listQuery.data])
  const liveKey = quorumKey(sortedQuorums.find(q => q.isLive)?.quorumHash)
  const requestedKey = quorumKey(requestedHash)
  const pinnedKey = sortedQuorums.some(q => quorumKey(q.quorumHash) === requestedKey)
    ? requestedKey
    : ''
  const selectedKey = pinnedKey || liveKey
  const selectedIndex = sortedQuorums.findIndex(q => quorumKey(q.quorumHash) === selectedKey)
  const selectedOffset = Math.max(0, selectedIndex)
  const neighbor = (delta: number) => {
    if (sortedQuorums.length < 2) return ''
    const index = (selectedOffset + delta + sortedQuorums.length) % sortedQuorums.length
    return quorumKey(sortedQuorums[index]?.quorumHash)
  }
  const prevKey = neighbor(-1)
  const nextKey = quorumKey(sortedQuorums[1]?.quorumHash)
  const followKey = neighbor(1)
  const details = useQueries({
    queries: sortedQuorums.map(q => {
      const key = quorumKey(q.quorumHash)
      return {
        queryKey: ['home', 'quorums', 'detail', key],
        queryFn: () => Api.getQuorumByHash(key),
        enabled:
          loadAllDetails || [liveKey, selectedKey, prevKey, nextKey, followKey].includes(key),
        staleTime: REFRESH_MS,
        refetchInterval: key === liveKey || key === selectedKey ? REFRESH_MS : false,
        retry: (count: number, error: Error) =>
          !(error instanceof ResponseErrorNotFound) && count < 1
      }
    }),
    combine: combineDetails
  })
  const detailQueries = details.queries
  const selectedQuery = selectedIndex >= 0 ? detailQueries[selectedIndex] : undefined
  const currentIndex = sortedQuorums.findIndex(q => q.isLive)
  const currentMeta = sortedQuorums[currentIndex]
  const currentQuorum = currentMeta
    ? { ...currentMeta, members: detailQueries[currentIndex]?.data?.members }
    : undefined

  // A detail may expire between list and detail requests. Reconcile once per failed request.
  const missingAt =
    selectedQuery?.error instanceof ResponseErrorNotFound ? selectedQuery.errorUpdatedAt : 0
  useEffect(() => {
    if (missingAt) void client.invalidateQueries({ queryKey: LIST_KEY })
  }, [client, missingAt])

  const retryRoster = () => {
    void listQuery.refetch()
    if (selectedQuery) void selectedQuery.refetch()
  }

  return {
    listQuery,
    sortedQuorums,
    quorumDetails: details.data,
    currentQuorum,
    liveKey,
    pinnedKey,
    selectedKey,
    prevKey,
    selectedOffset,
    selectedQuery,
    retryRoster
  }
}
