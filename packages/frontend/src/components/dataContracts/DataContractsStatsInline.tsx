'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'
import type { LoadableState, Status, WithClassName } from '../../types'

export default function DataContractsStatsInline ({ className }: WithClassName) {
  const [status, setStatus] = useState<LoadableState<Status>>({
    data: null,
    loading: true,
    error: false
  })

  useEffect(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }, [])

  const items = [
    {
      label: 'Total',
      value: formatFullNumber(status.data?.dataContractsCount) as ReactNode,
      loading: status.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
