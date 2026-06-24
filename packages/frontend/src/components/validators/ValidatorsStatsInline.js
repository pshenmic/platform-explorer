'use client'

import Link from 'next/link'
import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'

const shortHash = (hash) => `${hash.slice(0, 6)}…${hash.slice(-4)}`

export default function ValidatorsStatsInline ({ total, className }) {
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

  const bestValidator = epoch.data?.bestValidator

  const items = [
    {
      label: 'Validators',
      value: typeof total === 'number' ? currencyRound(total) : null,
      loading: total == null
    },
    {
      label: 'Epoch',
      value: typeof status.data?.epoch?.number === 'number' ? `#${status.data.epoch.number}` : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: status.loading
    },
    {
      label: 'Fees',
      value: typeof epoch.data?.totalCollectedFees === 'number' ? currencyRound(epoch.data.totalCollectedFees) : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    },
    {
      label: 'Best validator',
      value: bestValidator
        ? <Link
            href={`/validator/${bestValidator}`}
            style={{ color: 'inherit', fontFamily: 'var(--chakra-fonts-mono)', whiteSpace: 'nowrap' }}
          >
            {shortHash(bestValidator)}
          </Link>
        : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items}/>
}
