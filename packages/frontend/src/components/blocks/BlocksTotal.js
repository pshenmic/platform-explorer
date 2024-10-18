'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import TotalCards from '../total/TotalCards'

export default function BlocksTotal () {
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
    <TotalCards
      cards={[
        {
          title: 'Epoch:',
          value: typeof status?.data?.epoch?.number === 'number' ? status.data.epoch.number : 'n/a',
          icon: 'Sandglass',
          loading: status.loading
        },
        {
          title: 'Blocks:',
          value: typeof status?.data?.api?.block?.height === 'number' ? currencyRound(status.data.api.block.height) : 'n/a',
          icon: 'Blocks',
          loading: status.loading
        },
        {
          title: 'Avg. TPS*:',
          value: typeof epoch?.data?.tps === 'number' ? epoch.data.tps.toFixed(4) : 'n/a',
          icon: 'Timer',
          loading: epoch.loading
        },
        {
          title: 'Transactions:',
          value: typeof status?.data?.transactionsCount === 'number' ? currencyRound(status.data.transactionsCount) : 'n/a',
          icon: 'Transactions',
          loading: status.loading
        }
      ]}
    />
  )
}
