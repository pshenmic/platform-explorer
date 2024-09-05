'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import TotalCards from '../total/TotalCards'
import { SideBlock } from '../containers'

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
    <SideBlock>
      <TotalCards
        cards={[
          {
            title: 'Epoch:',
            value: status?.data?.epoch?.number !== undefined ? status.data.epoch.number : 'n/a',
            icon: 'Sandglass',
            loading: status.loading
          },
          {
            title: 'Blocks:',
            value: currencyRound(status?.data?.api?.block?.height) || '-',
            icon: 'Blocks',
            loading: status.loading
          },
          {
            title: 'Avg. TPS*:',
            value: epoch?.data?.tps?.toFixed(4) || 'n/a',
            icon: 'Timer',
            loading: epoch.loading
          },
          {
            title: 'Transactions:',
            value: currencyRound(status?.data?.transactionsCount) || '-',
            icon: 'Transactions',
            loading: status.loading
          }
        ]}
      />
    </SideBlock>
  )
}
