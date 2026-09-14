'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { LoadableState } from '../../types/common'
import type { EpochData, Status } from '../../types'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { DashboardCards } from '../cards'
import { BlockIcon, HourglassIcon, TransactionsIcon } from '../ui/icons'
import { EpochCardContent } from '../cards/dashboard'

export default function BlocksDashboardCards() {
  const [status, setStatus] = useState<LoadableState<Partial<Status>>>({
    data: {},
    loading: true,
    error: false
  })
  const [epoch, setEpoch] = useState<LoadableState<Partial<EpochData>>>({
    data: {},
    loading: true,
    error: false
  })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        if (res?.epoch?.number != null) {
          Api.getEpoch(res.epoch.number)
            .then(epochRes => fetchHandlerSuccess(setEpoch, epochRes))
            .catch(err => fetchHandlerError(setEpoch, err))
        }
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      sliderMode={'never'}
      cards={[
        {
          title: 'Epoch',
          value: (
            <EpochCardContent status={status?.data ? { epoch: status.data.epoch ?? null } : null} />
          ),
          error:
            typeof status?.data?.epoch?.number !== 'number' &&
            typeof status?.data?.epoch?.number !== 'string',
          loading: status.loading
        },
        {
          title: 'Avg. TPS',
          value: epoch.data?.tps?.toFixed(4),
          error: typeof epoch?.data?.tps !== 'number' && typeof epoch?.data?.tps !== 'string',
          loading: epoch.loading,
          icon: HourglassIcon
        },
        {
          title: 'Blocks',
          value: currencyRound(status.data?.api?.block?.height ?? 0),
          error:
            typeof status?.data?.api?.block?.height !== 'number' &&
            typeof status?.data?.api?.block?.height !== 'string',
          loading: status.loading,
          icon: BlockIcon
        },
        {
          title: 'Transactions',
          value: currencyRound(status.data?.transactionsCount ?? 0),
          error:
            typeof status.data?.transactionsCount !== 'number' &&
            typeof status.data?.transactionsCount !== 'string',
          loading: status.loading,
          icon: TransactionsIcon
        }
      ]}
    />
  )
}
