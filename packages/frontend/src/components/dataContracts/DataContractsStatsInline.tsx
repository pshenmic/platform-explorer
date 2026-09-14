'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'
import type { LoadableState, Status, WithClassName } from '../../types'

export default function DataContractsStatsInline({
  className,
  total
}: WithClassName & { total?: number | null }) {
  const [status, setStatus] = useState<LoadableState<Status>>({
    data: null,
    loading: true,
    error: false
  })

  useEffect(() => {
    if (typeof total === 'number') return

    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }, [total])

  const value = typeof total === 'number' ? total : status.data?.dataContractsCount

  const items = [
    {
      label: 'Total',
      value: formatFullNumber(value) as ReactNode,
      loading: typeof total !== 'number' && status.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items} />
}
