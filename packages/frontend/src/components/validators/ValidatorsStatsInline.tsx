'use client'

import type { ReactNode } from 'react'
import type { LoadableState } from '../../types/common'
import type { Status, EpochData } from '../../types'
import Link from 'next/link'
import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { fetchHandlerSuccess, fetchHandlerError, formatFullNumber } from '../../util'
import NetworkStatsInline from '../stats/NetworkStatsInline'

const shortHash = (hash: string) => `${hash.slice(0, 6)}…${hash.slice(-4)}`

interface ValidatorsStatsInlineProps {
  total?: number
  className?: string
}

export default function ValidatorsStatsInline({ total, className }: ValidatorsStatsInlineProps) {
  const [status, setStatus] = useState<LoadableState<Status>>({
    data: null,
    loading: true,
    error: false
  })
  const [epoch, setEpoch] = useState<LoadableState<EpochData>>({
    data: null,
    loading: true,
    error: false
  })

  useEffect(() => {
    Api.getStatus()
      .then(res => {
        fetchHandlerSuccess(setStatus, res)

        Api.getEpoch(res?.epoch?.number as number)
          .then(res => fetchHandlerSuccess(setEpoch, res))
          .catch(err => fetchHandlerError(setEpoch, err))
      })
      .catch(err => fetchHandlerError(setStatus, err))
  }, [])

  const bestValidator = epoch.data?.bestValidator

  const items: Array<{ label: string; value?: ReactNode; loading?: boolean; color?: string }> = [
    {
      label: 'Total',
      value: typeof total === 'number' ? String(formatFullNumber(total)) : null,
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
      value:
        typeof epoch.data?.totalCollectedFees === 'number'
          ? String(formatFullNumber(epoch.data.totalCollectedFees))
          : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    },
    {
      label: 'Best validator',
      value: bestValidator ? (
        <Link
          href={`/validator/${bestValidator}`}
          style={{ color: 'inherit', fontFamily: 'var(--chakra-fonts-mono)', whiteSpace: 'nowrap' }}
        >
          {shortHash(bestValidator)}
        </Link>
      ) : null,
      color: 'var(--chakra-colors-brand-light)',
      loading: epoch.loading
    }
  ]

  return <NetworkStatsInline className={className} items={items} />
}
