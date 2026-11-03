'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { validatorApr } from '../../../util/validatorApr'
import { epochProgress } from '../../../util/epochProgress'
import { Skeleton } from '../../../components/home/Skeleton'
import { InfoContainer } from '../../../components/ui/containers'
import { Badge } from '../../../components/ui/Badge/Badge'
import { Tooltip } from '../../../components/ui/Tooltips'
import './ValidatorEarnings.css'

const BLOCK_MS = 150_000

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const seconds = total % 60
  const minutes = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3600) % 24
  const days = Math.floor(total / 86400)
  const pad = (value: number) => String(value).padStart(2, '0')
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

function PaymentCountdown({
  blocks,
  tipTime,
  blockMs
}: {
  blocks: number
  tipTime?: string | null
  blockMs?: number | null
}) {
  const [now, setNow] = useState(() => Date.now())
  const openedAt = useRef(Date.now())

  useEffect(() => {
    openedAt.current = Date.now()
  }, [blocks, tipTime, blockMs])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const tip = tipTime ? Date.parse(tipTime) : openedAt.current
  const origin = Number.isFinite(tip) ? tip : openedAt.current
  const interval = blockMs != null && blockMs > 0 ? blockMs : BLOCK_MS
  const remain = Math.max(0, origin + blocks * interval - now)

  return <>{formatCountdown(remain)}</>
}

function yieldDash(dash: number) {
  if (dash > 0 && dash < 0.01) return '<0.01'
  return dash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function EpochCountdown() {
  const [now, setNow] = useState(() => Date.now())
  const query = useQuery({
    queryKey: ['validator-current-epoch'],
    queryFn: () => Api.getEpoch(),
    staleTime: 60000,
    refetchInterval: 60000
  })
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  if (query.isPending) return <Skeleton w={100} h={'1em'} />
  const end = query.data?.epoch.endTime
  if (query.isError || end == null || !Number.isFinite(end)) return <>Unavailable</>
  const remaining = end - now
  if (remaining <= 0) return <>Awaiting next epoch</>
  const start = query.data?.epoch.startTime
  const progress = start == null ? null : epochProgress(start, end, now)
  return (
    <span
      className="ValidatorPage__EpochCountdown"
      title={`${progress == null ? '' : `${Math.floor(progress)}% of epoch time elapsed. `}Estimated epoch end, not the time of the next Platform payment.`}
    >
      {formatCountdown(remaining)}
    </span>
  )
}

export default function ValidatorEarnings({
  hash,
  nodeType,
  loading,
  blocksUntilCorePayment,
  coreTipTime,
  coreBlockIntervalMs,
  banned,
  collateral,
  collateralAmount
}: {
  hash: string
  nodeType?: string | null
  loading: boolean
  blocksUntilCorePayment?: number | null
  coreTipTime?: string | null
  coreBlockIntervalMs?: number | null
  banned: boolean
  collateral: ReactNode
  collateralAmount: string
}) {
  const query = useQuery({
    queryKey: ['validator-earnings', hash],
    enabled: Boolean(hash),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1,
    queryFn: () => Api.getValidatorEarnings(hash)
  })
  const data = query.isError ? undefined : query.data?.estimate
  const pending = loading || query.isPending
  const ineligible = banned || data?.eligible === false
  const amount = (value?: number | null) =>
    pending ? (
      <Skeleton w={100} h={'1em'} />
    ) : ineligible || value == null ? (
      'Unavailable'
    ) : (
      <span className="ValidatorPage__MonthlyAmount">
        <span>{yieldDash(value)}</span>
        <span className="ValidatorPage__EarningsUnit">
          <span className="ValidatorPage__DashLogo" role="img" aria-label="DASH" />
          <span title="per month">/ mo</span>
        </span>
      </span>
    )
  const apr = ineligible ? null : validatorApr(data?.totalPerMonth, nodeType)

  return (
    <section className="ValidatorPage__Earnings" aria-label="Estimated earnings">
      <InfoContainer className="ValidatorPage__Group ValidatorPage__EarningsPanel">
        <div className="ValidatorPage__EarningsOverview">
          <div className="ValidatorPage__CollateralHeader">
            <h2 className="ValidatorPage__EarningsTitle">Collateral</h2>
            <Badge
              className="ValidatorPage__AmountBadge ValidatorPage__EarningsBadge"
              colorScheme={collateralAmount && !loading ? 'blue' : 'dimGray'}
            >
              {loading ? <Skeleton w={80} h="1em" /> : collateralAmount || 'Unavailable'}
            </Badge>
            <Tooltip
              className="ValidatorPage__Tooltip"
              content={
                <>
                  Collateral: required DASH backing the node, not an expense.
                  <br />
                  APR: monthly forecast × 365 / 30 ÷ collateral × 100.
                  <br />
                  Gross estimate before splits and expenses; no compounding or guaranteed return.
                </>
              }
            >
              <button
                type="button"
                className="ValidatorPage__CollateralInfo"
                aria-label="About collateral and estimated APR"
              >
                ⓘ
              </button>
            </Tooltip>
            <div className="ValidatorPage__Collateral" aria-label="Collateral address">
              {collateral}
            </div>
          </div>
          <div>
            <Tooltip
              className="ValidatorPage__Tooltip"
              content="Gross forecast for a 30-day month, based on indexed payouts. Core and Platform are the monthly components. Before splits and expenses; not guaranteed."
            >
              <div
                className="ValidatorPage__EarningsTotal"
                tabIndex={0}
                aria-label="Estimated monthly earnings"
                data-unavailable={
                  (!pending && (ineligible || data?.totalPerMonth == null)) || undefined
                }
              >
                {amount(data?.totalPerMonth)}
              </div>
            </Tooltip>
          </div>
          <div className="ValidatorPage__Apr">
            <span className="ValidatorPage__SummaryLabel">APR</span>
            <div
              className="ValidatorPage__EarningsTotal"
              data-unavailable={(!pending && apr == null) || undefined}
            >
              {pending ? (
                <Skeleton w={80} h="1em" />
              ) : apr == null ? (
                'Unavailable'
              ) : (
                `${apr.toFixed(2)}%`
              )}
            </div>
          </div>
        </div>
        <div className="ValidatorPage__EarningsSources">
          <div
            className="ValidatorPage__EarningsSource"
            aria-label="Estimated Core earnings per month"
          >
            <div className="ValidatorPage__EarningsSourceHead">
              <span className="ValidatorPage__SummaryLabel">Core</span>
            </div>
            <div
              className="ValidatorPage__EarningsAmount"
              data-unavailable={
                (!pending && (ineligible || data?.corePerMonth == null)) || undefined
              }
            >
              {amount(data?.corePerMonth)}
            </div>
            <div className="ValidatorPage__EarningsNext">
              <Tooltip
                className="ValidatorPage__Tooltip"
                content="Estimated time to the next Core payment, based on remaining blocks and block interval. Actual timing may change."
              >
                <span tabIndex={0}>
                  Next payment{' '}
                  <span className="ValidatorPage__InfoMark" aria-hidden="true">
                    ⓘ
                  </span>
                </span>
              </Tooltip>
              <span>
                {pending ? (
                  <Skeleton w={100} h="1em" />
                ) : banned ? (
                  'Banned'
                ) : blocksUntilCorePayment == null ? (
                  'Unavailable'
                ) : (
                  <PaymentCountdown
                    blocks={blocksUntilCorePayment}
                    tipTime={coreTipTime}
                    blockMs={coreBlockIntervalMs}
                  />
                )}
              </span>
            </div>
          </div>
          <div
            className="ValidatorPage__EarningsSource"
            aria-label="Estimated Platform earnings per month"
          >
            <div className="ValidatorPage__EarningsSourceHead">
              <span className="ValidatorPage__SummaryLabel">Platform</span>
            </div>
            <div
              className="ValidatorPage__EarningsAmount"
              data-unavailable={
                (!pending && (ineligible || data?.platformPerMonth == null)) || undefined
              }
            >
              {amount(data?.platformPerMonth)}
            </div>
            <div className="ValidatorPage__PlatformTiming">
              <div className="ValidatorPage__EarningsNext">
                <Tooltip
                  className="ValidatorPage__Tooltip"
                  content="Countdown to the estimated epoch end, used as a reference for Platform rewards. It does not guarantee when this validator will receive a payment."
                >
                  <span tabIndex={0}>
                    Next payment{' '}
                    <span className="ValidatorPage__InfoMark" aria-hidden="true">
                      ⓘ
                    </span>
                  </span>
                </Tooltip>
                <span>
                  <EpochCountdown />
                </span>
              </div>
            </div>
          </div>
        </div>
        {(query.isError || ineligible) && (
          <div className="ValidatorPage__SummaryHint">
            {query.isError ? (
              <span className="ValidatorPage__LoadError">
                Earnings unavailable
                <button type="button" onClick={() => void query.refetch()}>
                  Retry
                </button>
              </span>
            ) : (
              'No forecast while the node is banned or unregistered.'
            )}
          </div>
        )}
      </InfoContainer>
    </section>
  )
}
