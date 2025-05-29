'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { DashboardCards } from '../cards'
import { BlockIcon, HourglassIcon, TransactionsIcon } from '../ui/icons'
import { EpochCardContent } from '../cards/dashboard'

export default function BlocksDashboardCards () {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  const fetchData = () => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }

  useEffect(fetchData, [])

  return (
    <DashboardCards
      cards={[
        {
          title: 'Epoch',
          value: <EpochCardContent status={status?.data}/>,
          error: typeof status?.data?.epoch?.number !== 'number' && typeof status?.data?.epoch?.number !== 'string',
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
          value: currencyRound(status.data?.api?.block?.height),
          error: typeof status?.data?.api?.block?.height !== 'number' && typeof status?.data?.api?.block?.height !== 'string',
          loading: status.loading,
          icon: BlockIcon
        },
        {
          title: 'Transactions',
          value: currencyRound(status.data?.transactionsCount),
          error: typeof status.data?.transactionsCount !== 'number' && typeof status.data?.transactionsCount !== 'string',
          loading: status.loading,
          icon: TransactionsIcon
        }
      ]}
    />
  )
}
