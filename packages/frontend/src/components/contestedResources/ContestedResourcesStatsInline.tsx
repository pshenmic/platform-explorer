'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'
import type { ContestedResourcesStatus, LoadableState, WithClassName } from '../../types'

export default function ContestedResourcesStatsInline({ className }: WithClassName) {
  const [stats, setStats] = useState<
    LoadableState<ContestedResourcesStatus | Record<string, unknown>>
  >({
    data: {},
    loading: true,
    error: false
  })

  useEffect(() => {
    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setStats, res))
      .catch(err => fetchHandlerError(setStats, err))
  }, [])

  const data = stats.data as ContestedResourcesStatus | null

  const items = [
    {
      label: 'Total',
      value: formatFullNumber(data?.totalContestedResources) as ReactNode,
      color: 'var(--chakra-colors-brand-light)',
      loading: stats.loading
    },
    {
      label: 'Pending',
      value: formatFullNumber(data?.totalPendingContestedResources) as ReactNode,
      color: 'var(--chakra-colors-orange-default)',
      loading: stats.loading
    },
    {
      label: 'Votes',
      value: formatFullNumber(data?.totalVotesCount) as ReactNode,
      color: 'var(--chakra-colors-green-label)',
      loading: stats.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items} />
}
