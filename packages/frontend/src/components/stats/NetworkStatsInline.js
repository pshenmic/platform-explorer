'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import './NetworkStatsInline.scss'

export default function NetworkStatsInline ({ className }) {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })
  const [epoch, setEpoch] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }, [])

  const items = [
    {
      label: 'Epoch',
      value: typeof status.data?.epoch?.number === 'number' ? `#${status.data.epoch.number}` : null,
      loading: status.loading
    },
    {
      label: 'Avg TPS',
      value: typeof epoch.data?.tps === 'number' ? epoch.data.tps.toFixed(4) : null,
      loading: epoch.loading
    },
    {
      label: 'Blocks',
      value: currencyRound(status.data?.api?.block?.height),
      loading: status.loading
    },
    {
      label: 'Transactions',
      value: currencyRound(status.data?.transactionsCount),
      loading: status.loading
    }
  ]

  return (
    <div className={`NetworkStatsInline ${className || ''}`}>
      {items.map((item, index) => (
        <div className={'NetworkStatsInline__Item'} key={index}>
          <span className={'NetworkStatsInline__Label'}>{item.label}</span>
          <span className={'NetworkStatsInline__Value'}>
            {item.loading ? '…' : (item.value ?? 'N/A')}
          </span>
        </div>
      ))}
    </div>
  )
}
