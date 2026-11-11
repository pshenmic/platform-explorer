'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { validatorApr } from '../../../util/validatorApr'
import { formatNumberWithSpaces } from '../../../util/numbers'
import { epochProgress } from '../../../util/epochProgress'
import { Skeleton } from '../../../components/home/Skeleton'
import { InfoContainer } from '../../../components/ui/containers'
import { Badge } from '../../../components/ui/Badge/Badge'
import { Tooltip } from '../../../components/ui/Tooltips'
import ValidatorSurface from './ValidatorSurface'
import ValidatorAmountDetails from './ValidatorAmountDetails'
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
  return formatNumberWithSpaces(dash, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      title={`${progress == null ? '' : `${Math.floor(progress)}% of epoch time elapsed\n`}Estimated epoch end`}
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
  collateralAmount,
  activity
}: {
  hash: string
  nodeType?: string | null
  loading: boolean
  blocksUntilCorePayment?: number | null
  coreTipTime?: string | null
  coreBlockIntervalMs?: number | null
  banned: boolean
  collateralAmount: number | null
  activity: ReactNode
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
  const missingEstimate = query.isError
    ? 'Could not load earnings.'
    : data?.eligible === false
      ? 'No estimate for banned or unregistered nodes.'
      : data?.eligible === true && data.platformPerMonth == null
        ? '30 days of Platform history needed.'
        : 'Estimate not provided.'
  const amount = (value?: number | null, showPeriod = true) =>
    pending ? (
      <Skeleton w={100} h={'1em'} />
    ) : value == null || !Number.isFinite(value) || value < 0 ? (
      '—'
    ) : (
      <span className="ValidatorPage__MonthlyAmount">
        <span>{yieldDash(value)}</span>
        <span className="ValidatorPage__EarningsUnit">
          <span>DASH</span>
          {showPeriod && <span>/ month</span>}
        </span>
      </span>
    )
  const apr = validatorApr(data?.totalPerMonth, nodeType)
  const annual = data?.totalPerMonth == null ? null : data.totalPerMonth * (365 / 30)
  const core = data?.corePerMonth
  const platform = data?.platformPerMonth
  const coreShare =
    !pending &&
    core != null &&
    platform != null &&
    Number.isFinite(core) &&
    Number.isFinite(platform) &&
    core >= 0 &&
    platform >= 0 &&
    Number.isFinite(core + platform) &&
    core + platform > 0
      ? (core / (core + platform)) * 100
      : null
  const compositionLabel =
    coreShare == null
      ? ''
      : `Estimated monthly rewards. Core: ${Math.round(coreShare)}%. Platform: ${100 - Math.round(coreShare)}%.`

  return (
    <section className="ValidatorPage__Earnings" aria-label="Estimated earnings">
      <InfoContainer className="ValidatorPage__Group ValidatorPage__EarningsPanel ValidatorPage__Surface ValidatorPage__Surface--earnings">
        <ValidatorSurface kind="earnings" />
        <div className="ValidatorPage__EarningsOverview">
          <div className="ValidatorPage__CollateralHeader">
            <Tooltip
              className="ValidatorPage__Tooltip"
              content="DASH held as collateral to operate this node."
            >
              <button
                type="button"
                className="ValidatorPage__CollateralInfo ValidatorPage__SummaryLabel"
              >
                Staked
              </button>
            </Tooltip>
            <Tooltip
              className="ValidatorPage__Tooltip"
              title="Staked"
              content={<ValidatorAmountDetails dash={loading ? null : collateralAmount} />}
            >
              <Badge
                className="ValidatorPage__AmountBadge ValidatorPage__EarningsBadge"
                tabIndex={0}
                colorScheme={collateralAmount && !loading ? 'gray' : 'dimGray'}
              >
                {loading ? (
                  <Skeleton w={80} h="1em" />
                ) : collateralAmount == null ? (
                  'Unavailable'
                ) : (
                  `${formatNumberWithSpaces(collateralAmount)} DASH`
                )}
              </Badge>
            </Tooltip>
          </div>
          <div className="ValidatorPage__ForecastRow ValidatorPage__ForecastRow--Monthly">
            <span className="ValidatorPage__SummaryLabel">Estimated monthly</span>
            <Tooltip
              className="ValidatorPage__Tooltip"
              content={
                !pending && data?.totalPerMonth != null ? (
                  <>
                    <ValidatorAmountDetails dash={data.totalPerMonth} />
                    <div>Core + Platform, 30 days. Before splits and expenses.</div>
                  </>
                ) : (
                  missingEstimate
                )
              }
            >
              <Badge
                className="ValidatorPage__AmountBadge ValidatorPage__Help"
                colorScheme="gray"
                tabIndex={0}
                aria-label="Estimated monthly earnings"
                data-unavailable={(!pending && data?.totalPerMonth == null) || undefined}
              >
                {amount(data?.totalPerMonth, false)}
              </Badge>
            </Tooltip>
            {coreShare != null && (
              <Tooltip
                className="ValidatorPage__Tooltip"
                title="Estimated monthly rewards"
                content={
                  <dl className="ValidatorPage__TooltipMetrics">
                    <div>
                      <dt>Core</dt>
                      <dd>{Math.round(coreShare)}%</dd>
                    </div>
                    <div>
                      <dt>Platform</dt>
                      <dd>{100 - Math.round(coreShare)}%</dd>
                    </div>
                  </dl>
                }
              >
                <span
                  className="ValidatorPage__EarningsComposition ValidatorPage__Help"
                  role="img"
                  aria-label={compositionLabel}
                  tabIndex={0}
                >
                  <span style={{ width: `${coreShare}%` }} />
                  <span style={{ width: `${100 - coreShare}%` }} />
                </span>
              </Tooltip>
            )}
          </div>
          <div className="ValidatorPage__ForecastRow ValidatorPage__ForecastRow--Yearly">
            <span className="ValidatorPage__SummaryLabel">Yearly</span>
            <Tooltip
              className="ValidatorPage__Tooltip"
              content={
                !pending && annual != null ? (
                  <>
                    <ValidatorAmountDetails dash={annual} />
                    <div>Monthly × 365 / 30. No compounding.</div>
                  </>
                ) : (
                  missingEstimate
                )
              }
            >
              <Badge
                className="ValidatorPage__AmountBadge ValidatorPage__Help"
                colorScheme="gray"
                tabIndex={0}
                aria-label="Estimated yearly earnings"
                data-unavailable={(!pending && annual == null) || undefined}
              >
                {amount(annual, false)}
              </Badge>
            </Tooltip>
          </div>
          <div className="ValidatorPage__Apr">
            <span className="ValidatorPage__SummaryLabel">APR</span>
            <Badge
              className="ValidatorPage__AmountBadge"
              colorScheme="gray"
              data-unavailable={(!pending && apr == null) || undefined}
            >
              {pending ? <Skeleton w={80} h="1em" /> : apr == null ? '—' : `${apr.toFixed(2)}%`}
            </Badge>
          </div>
        </div>
        <div className="ValidatorPage__EarningsSources">
          <div
            className="ValidatorPage__EarningsSource ValidatorPage__EarningsSource--Core"
            aria-label="Estimated Core earnings per month"
          >
            <div className="ValidatorPage__EarningsSourceHead">
              <span className="ValidatorPage__SummaryLabel">Core</span>
            </div>
            <div
              className="ValidatorPage__EarningsAmount"
              data-unavailable={(!pending && data?.corePerMonth == null) || undefined}
            >
              <Tooltip
                className="ValidatorPage__Tooltip"
                title="Core monthly estimate"
                content={
                  !pending && data?.corePerMonth != null ? (
                    <ValidatorAmountDetails dash={data.corePerMonth} />
                  ) : (
                    missingEstimate
                  )
                }
              >
                <span className="ValidatorPage__Help" tabIndex={0}>
                  {amount(data?.corePerMonth)}
                </span>
              </Tooltip>
            </div>
            <div className="ValidatorPage__EarningsNext">
              <Tooltip
                className="ValidatorPage__Tooltip"
                content="Estimated payment time based on remaining Core blocks."
              >
                <span className="ValidatorPage__Help" tabIndex={0}>
                  Next payment
                </span>
              </Tooltip>
              <span>
                {pending ? (
                  <Skeleton w={100} h="1em" />
                ) : banned || blocksUntilCorePayment == null ? (
                  '—'
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
            className="ValidatorPage__EarningsSource ValidatorPage__EarningsSource--Platform"
            aria-label="Estimated Platform earnings per month"
          >
            <div className="ValidatorPage__EarningsSourceHead">
              <span className="ValidatorPage__SummaryLabel">Platform</span>
            </div>
            <div
              className="ValidatorPage__EarningsAmount"
              data-unavailable={(!pending && data?.platformPerMonth == null) || undefined}
            >
              <Tooltip
                className="ValidatorPage__Tooltip"
                title="Platform monthly estimate"
                content={
                  !pending && data?.platformPerMonth != null ? (
                    <ValidatorAmountDetails dash={data.platformPerMonth} />
                  ) : (
                    missingEstimate
                  )
                }
              >
                <span className="ValidatorPage__Help" tabIndex={0}>
                  {amount(data?.platformPerMonth)}
                </span>
              </Tooltip>
            </div>
            <div className="ValidatorPage__PlatformTiming">
              <div className="ValidatorPage__EarningsNext">
                <Tooltip
                  className="ValidatorPage__Tooltip"
                  content="Estimated time until the current Platform epoch ends."
                >
                  <span className="ValidatorPage__Help" tabIndex={0}>
                    Epoch ends in
                  </span>
                </Tooltip>
                <span>
                  <EpochCountdown />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="ValidatorPage__EarningsActivity"
          role="group"
          aria-label="Validator activity"
        >
          {activity}
        </div>
        {query.isError && (
          <div className="ValidatorPage__SummaryHint">
            <span className="ValidatorPage__LoadError">
              Earnings unavailable
              <button type="button" onClick={() => void query.refetch()}>
                Retry
              </button>
            </span>
          </div>
        )}
      </InfoContainer>
    </section>
  )
}
