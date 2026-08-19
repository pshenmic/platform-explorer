'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import type { LoadableState, WithClassName } from '../../types/common'
import type { Status, EpochData } from '../../types'
import './NetworkStatsInline.css'

interface NetworkStatsItem {
  label: ReactNode
  value?: ReactNode
  loading?: boolean
  color?: string
}

interface NetworkStatsInlineProps extends WithClassName {
  items?: NetworkStatsItem[]
}

export default function NetworkStatsInline ({ className, items: itemsProp }: NetworkStatsInlineProps) {
  const useDefault = !itemsProp
  const [status, setStatus] = useState<LoadableState<Status>>({ data: null, loading: true, error: false })
  const [epoch, setEpoch] = useState<LoadableState<EpochData>>({ data: null, loading: true, error: false })

  useEffect(() => {
    if (!useDefault) return

    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }, [useDefault])

  const items: NetworkStatsItem[] = itemsProp || [
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
      value: formatFullNumber(status.data?.api?.block?.height) as ReactNode,
      loading: status.loading
    },
    {
      label: 'Transactions',
      value: formatFullNumber(status.data?.transactionsCount) as ReactNode,
      loading: status.loading
    }
  ]

  return (
    <div className={`NetworkStatsInline ${className || ''}`}>
      {items.map((item, index) => {
        const valueStyle: CSSProperties | undefined = item.color ? { color: item.color } : undefined
        return (
          <div className={'NetworkStatsInline__Item'} key={index}>
            <span className={'NetworkStatsInline__Label'}>{item.label}</span>
            <span className={'NetworkStatsInline__Value'} style={valueStyle}>
              {item.loading ? '…' : (item.value ?? 'N/A')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
