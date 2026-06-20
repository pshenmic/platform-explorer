'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
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
      label: 'Resources',
      value: currencyRound(stats.data?.totalContestedResources),
      loading: stats.loading
    },
    {
      label: 'Pending',
      value: currencyRound(stats.data?.totalPendingContestedResources),
      loading: stats.loading
    },
    {
      label: 'Votes',
      value: currencyRound(stats.data?.totalVotesCount),
      loading: stats.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
