'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'

export default function DataContractsStatsInline ({ className }) {
  const [status, setStatus] = useState({ data: {}, loading: true, error: false })

  useEffect(() => {
    Api.getStatus()
      .then(res => fetchHandlerSuccess(setStatus, res))
      .catch(err => fetchHandlerError(setStatus, err))
  }, [])

  const items = [
    {
      label: 'Total',
      value: formatFullNumber(status.data?.dataContractsCount),
      loading: status.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
