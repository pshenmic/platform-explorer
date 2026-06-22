'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'

export default function MasternodeVotesStatsInline ({ total, className }) {
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    Api.getEpoch()
      .then(res => fetchHandlerSuccess(setEpoch, res))
      .catch(err => fetchHandlerError(setEpoch, err))
  }, [])

  const items = [
    {
      label: 'Votes',
      value: typeof total === 'number' ? currencyRound(total) : null,
      color: 'var(--chakra-colors-green-label)',
      loading: total == null
    },
    {
      label: 'Epoch votes',
      value: typeof epoch.data?.totalVotesCount === 'number' ? currencyRound(epoch.data.totalVotesCount) : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    },
    {
      label: 'Fees',
      value: typeof epoch.data?.totalCollectedFees === 'number' ? currencyRound(epoch.data.totalCollectedFees) : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
