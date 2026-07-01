'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'

export default function ContestedResourcesStatsInline ({ className }) {
  const [stats, setStats] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    Api.getContestedResourcesStats()
      .then(res => fetchHandlerSuccess(setStats, res))
      .catch(err => fetchHandlerError(setStats, err))
  }, [])

  const items = [
    {
      label: 'Total',
      value: formatFullNumber(stats.data?.totalContestedResources),
      color: 'var(--chakra-colors-brand-light)',
      loading: stats.loading
    },
    {
      label: 'Pending',
      value: formatFullNumber(stats.data?.totalPendingContestedResources),
      color: 'var(--chakra-colors-orange-default)',
      loading: stats.loading
    },
    {
      label: 'Votes',
      value: formatFullNumber(stats.data?.totalVotesCount),
      color: 'var(--chakra-colors-green-label)',
      loading: stats.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
