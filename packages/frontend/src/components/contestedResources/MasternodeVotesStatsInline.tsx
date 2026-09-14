'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'
import type { EpochData, LoadableState, WithClassName } from '../../types'

interface MasternodeVotesStatsInlineProps extends WithClassName {
  total?: number | null
}

export default function MasternodeVotesStatsInline({
  total,
  className
}: MasternodeVotesStatsInlineProps) {
  const [epoch, setEpoch] = useState<LoadableState<EpochData | Record<string, unknown>>>({
    data: {},
    loading: true,
    error: false
  })

  useEffect(() => {
    Api.getEpoch()
      .then(res => fetchHandlerSuccess(setEpoch, res))
      .catch(err => fetchHandlerError(setEpoch, err))
  }, [])

  const data = epoch.data as EpochData | null

  const items = [
    {
      label: 'Total',
      value: (typeof total === 'number' ? formatFullNumber(total) : null) as ReactNode,
      color: 'var(--pe-color-green-label)',
      loading: total == null
    },
    {
      label: 'Epoch votes',
      value: (typeof data?.totalVotesCount === 'number'
        ? formatFullNumber(data.totalVotesCount)
        : null) as ReactNode,
      color: 'var(--pe-color-brand-light)',
      loading: epoch.loading
    },
    {
      label: 'Fees',
      value: (typeof data?.totalCollectedFees === 'number'
        ? formatFullNumber(data.totalCollectedFees)
        : null) as ReactNode,
      color: 'var(--pe-color-brand-light)',
      loading: epoch.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items} />
}
