'use client'

import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import Tooltip from './Tooltip'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../../util'
import * as Api from '../../../util/Api'
import type { Rate } from '../../../types'
import './RateTooltip.css'

interface RateTooltipProps {
  credits?: number
  dash?: number
  usd?: number
  rate?: Pick<Rate, 'usd'> | null
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

function formatDash(value: number) {
  return String(removeTrailingZeros(Number(value).toFixed(8)))
}

function formatUsd(value: number) {
  if (value >= 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  return `$${roundUsd(value)}`
}

function Row({ value, unit }: { value: string; unit: string }) {
  return (
    <>
      <span className={'RateTooltip__Value'}>{value}</span>
      <span className={'RateTooltip__Unit'}>{unit}</span>
    </>
  )
}

export default function RateTooltip({
  credits,
  dash,
  usd,
  rate,
  children,
  placement
}: RateTooltipProps) {
  const rateQuery = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate(),
    staleTime: 60_000,
    enabled: rate == null && usd == null
  })
  const resolvedRate = rate ?? rateQuery.data ?? null

  let resolvedDash = dash
  let resolvedUsd = usd
  if (resolvedDash == null && typeof credits === 'number') resolvedDash = creditsToDash(credits)
  if (
    resolvedUsd == null &&
    typeof resolvedDash === 'number' &&
    typeof resolvedRate?.usd === 'number'
  ) {
    resolvedUsd = resolvedDash * resolvedRate.usd
  }

  return (
    <Tooltip
      label={
        <div className={'RateTooltip'}>
          {typeof credits === 'number' && Number.isFinite(credits) && (
            <Row value={credits.toLocaleString('en-US')} unit={'Credits'} />
          )}
          {typeof resolvedDash === 'number' && Number.isFinite(resolvedDash) && (
            <Row value={formatDash(resolvedDash)} unit={'Dash'} />
          )}
          {typeof resolvedUsd === 'number' && Number.isFinite(resolvedUsd) && (
            <Row value={formatUsd(resolvedUsd)} unit={'USD'} />
          )}
        </div>
      }
      placement={placement || 'top'}
    >
      {children}
    </Tooltip>
  )
}
