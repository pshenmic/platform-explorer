'use client'

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { getL1ExplorerLink } from '../../../util/l1Explorer'
import { useCoreBlockLink } from '../../../util/useCoreBlockLink'
import {
  fetchHandlerSuccess,
  fetchHandlerError,
  creditsToDash,
  removeTrailingZeros
} from '../../../util'
import { Skeleton } from '../../../components/home/Skeleton'
import ValidatorActivityLists from './ValidatorActivityLists'
import ValidatorEpochs from './ValidatorEpochs'
import Link from 'next/link'
import { Identifier, DateBlock, IpAddress, InfoLine, NotActive } from '../../../components/data'
import { PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { CopyButton } from '../../../components/ui/Buttons'
import { Badge } from '../../../components/ui/Badge/Badge'
import ImageGenerator from '../../../components/imageGenerator'
import { BlockIcon, CircleIcon } from '../../../components/ui/icons'

import { RateTooltip, Tooltip } from '../../../components/ui/Tooltips'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { useActiveNetwork } from 'src/contexts'
import type { Validator as ValidatorType } from '../../../types/Validator'
import type { LoadableState, Rate } from '../../../types'

import { getValidatorStatus } from '../../../components/validators/validatorStatus'

import './ValidatorPage.css'

/** API endpoint status may include a free-form message. */
type EndpointStatus = {
  host?: string
  port?: number
  status?: string
  message?: string
} | null

/** Epoch fields used on the page (API may flatten Epoch onto epochInfo). */
type EpochInfo = {
  number?: number
  startTime?: number | string
  endTime?: number | string
} | null

type ValidatorDetail = Omit<Partial<ValidatorType>, 'epochInfo' | 'endpoints' | 'proTxInfo'> & {
  epochInfo?: EpochInfo
  endpoints?: {
    coreP2PPortStatus?: EndpointStatus
    platformP2PPortStatus?: EndpointStatus
    platformGrpcPortStatus?: EndpointStatus
  } | null
  proTxInfo?: {
    type?: string
    collateralAddress?: string | null
    state?: {
      registeredHeight?: number
      PoSeBanHeight?: number
      PoSeRevivedHeight?: number
      PoSePenalty?: number
      ownerAddress?: string
      votingAddress?: string
      payoutAddress?: string
      pubKeyOperator?: string
      platformNodeID?: string
    } | null
  } | null
}

interface ValidatorProps {
  hash: string
}

function dashAmount(credits: number) {
  const dash = creditsToDash(credits)
  const digits = Math.abs(dash) >= 100 ? 2 : Math.abs(dash) >= 1 ? 4 : 8
  return String(removeTrailingZeros(dash.toFixed(digits)))
}

function KeyIdentifier({
  value,
  href,
  external
}: {
  value: string
  href?: string
  external?: boolean
}) {
  const identifier = (
    <Identifier ellipsis={true} styles={['highlight-both']} copyButton={!href}>
      {value}
    </Identifier>
  )

  if (!href) return identifier

  const linked = external ? (
    <a
      className={'ValidatorPage__KeyLink'}
      href={href}
      target={'_blank'}
      rel={'noopener noreferrer'}
    >
      {identifier}
    </a>
  ) : (
    <Link className={'ValidatorPage__KeyLink'} href={href}>
      {identifier}
    </Link>
  )

  return (
    <span className={'ValidatorPage__KeyLine'}>
      {linked}
      <CopyButton className={'Identifier__CopyButton'} text={value} />
    </span>
  )
}

const DAY_MS = 86400000

const BLOCK_MS = 150_000

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const seconds = total % 60
  const minutes = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3600) % 24
  const days = Math.floor(total / 86400)
  const pad = (value: number) => String(value).padStart(2, '0')
  if (days > 0) return `~${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  if (hours > 0) return `~${hours}:${pad(minutes)}:${pad(seconds)}`
  return `~${minutes}:${pad(seconds)}`
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

  return (
    <>
      {blocks.toLocaleString('en-US')} {blocks === 1 ? 'block' : 'blocks'} ·{' '}
      {formatCountdown(remain)}
    </>
  )
}

function yieldDash(dash: number) {
  if (Math.abs(dash) >= 100) return Math.round(dash).toLocaleString('en-US')
  if (dash > 0 && dash < 0.00000001) return '<0.00000001'
  const digits = Math.abs(dash) >= 10 ? 2 : Math.abs(dash) >= 1 ? 4 : 8
  return String(removeTrailingZeros(dash.toFixed(digits)))
}

function EarningsCard({
  hash,
  loading,
  blocksUntilCorePayment,
  coreTipTime,
  coreBlockIntervalMs,
  banned
}: {
  hash: string
  loading: boolean
  blocksUntilCorePayment?: number | null
  coreTipTime?: string | null
  coreBlockIntervalMs?: number | null
  banned: boolean
}) {
  const query = useQuery({
    queryKey: ['validator-earnings', hash],
    enabled: Boolean(hash),
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1,
    queryFn: () => Api.getValidatorEarnings(hash)
  })
  const data = query.isError ? undefined : query.data
  const pending = loading || query.isPending
  const ineligible = banned || data?.eligible === false
  const amount = (value?: number | null) =>
    pending ? (
      <Skeleton w={100} h={'1em'} />
    ) : ineligible || value == null ? (
      'Unavailable'
    ) : (
      `≈ ${yieldDash(value)} DASH`
    )
  const history = data?.platformHistory
  const period = history
    ? `Platform: epochs ${history.firstEpoch.toLocaleString('en-US')}–${history.lastEpoch.toLocaleString('en-US')} (${new Date(history.startTime).toLocaleDateString('en-GB')}–${new Date(history.endTime).toLocaleDateString('en-GB')}).`
    : 'Platform requires six complete finalized epochs.'

  return (
    <InfoContainer className={'ValidatorPage__Group ValidatorPage__Yield'}>
      <div className={'ValidatorPage__EarningsHeader'}>
        <div className={'ValidatorPage__SummaryLabel'}>
          <Tooltip
            content={`Gross node earnings before owner/operator splits, reward shares and expenses. Core uses the latest payment and up to 576 block intervals. ${period} A month means 30 days; future earnings can change.`}
          >
            <span tabIndex={0}>Estimated earnings ⓘ</span>
          </Tooltip>
        </div>
        <div className={'ValidatorPage__EarningsTotal'}>
          {amount(data?.totalPerMonth)}
          {!pending && !ineligible && data?.totalPerMonth != null && <span> / month</span>}
        </div>
      </div>
      <dl className={'ValidatorPage__YieldRows'}>
        <div>
          <dt>Core / month</dt>
          <dd>{amount(data?.corePerMonth)}</dd>
        </div>
        <div>
          <dt>Platform / month</dt>
          <dd>{amount(data?.platformPerMonth)}</dd>
        </div>
        <div>
          <dt>Next Core payment</dt>
          <dd>
            {pending ? (
              <Skeleton w={100} h={'1em'} />
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
          </dd>
        </div>
      </dl>
      <div className={'ValidatorPage__SummaryHint'}>
        {query.isError ? (
          <span className={'ValidatorPage__LoadError'}>
            Earnings unavailable
            <button type={'button'} onClick={() => void query.refetch()}>
              Retry
            </button>
          </span>
        ) : ineligible ? (
          'No forecast while the node is banned or unregistered.'
        ) : (
          <>
            Gross estimate · 30-day month
            {history && (
              <>
                <br />
                Platform based on epochs {history.firstEpoch.toLocaleString('en-US')}–
                {history.lastEpoch.toLocaleString('en-US')}
              </>
            )}
          </>
        )}
      </div>
    </InfoContainer>
  )
}

function WithdrawalsCard({ identity, loading }: { identity?: string | null; loading: boolean }) {
  const query = useQuery({
    queryKey: ['identity-withdrawals', identity],
    enabled: Boolean(identity),
    staleTime: 60000,
    retry: 1,
    queryFn: () => Api.getWithdrawalsByIdentity(identity as string, 1, 100, 'desc')
  })
  const rows = query.data?.resultSet ?? []
  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  return (
    <SummaryCard
      label={'Withdrawals'}
      loading={loading || (Boolean(identity) && query.isPending)}
      value={query.isError || !identity ? <NotActive /> : `${dashAmount(total)} DASH`}
      hint={
        query.isError || query.isPending ? null : (
          <a href={'#withdrawals'} className={'ValidatorPage__WithdrawalMore'}>
            {rows.length === 1 ? '1 withdrawal to Core' : `${rows.length} withdrawals to Core`}
          </a>
        )
      }
    />
  )
}

function HostWithFlag({
  host,
  port,
  countryCode,
  place
}: {
  host?: string | null
  port?: string | number | null
  countryCode?: string | null
  place?: string | null
}) {
  const cc = countryCode?.trim().toLowerCase()
  return (
    <span className={'ValidatorPage__Host'}>
      {cc ? (
        <img
          className={'ValidatorPage__Flag'}
          src={`/flags/circle/${cc}.svg`}
          alt={''}
          title={place || countryCode || undefined}
        />
      ) : null}
      <IpAddress host={host} port={port} />
    </span>
  )
}

function nodeTypeLabel(type?: string | null) {
  if (!type) return null
  return type.toLowerCase() === 'evo' ? 'Evonode' : 'Masternode'
}

function SummaryCard({
  label,
  value,
  hint,
  loading,
  placeholder,
  tone,
  className
}: {
  label?: ReactNode
  value: ReactNode
  hint?: ReactNode
  loading?: boolean
  placeholder?: ReactNode
  tone?: string
  className?: string
}) {
  return (
    <InfoContainer className={['ValidatorPage__SummaryCard', className].filter(Boolean).join(' ')}>
      {label ? <span className={'ValidatorPage__SummaryLabel'}>{label}</span> : null}
      <div
        className={`ValidatorPage__SummaryValue${tone ? ` ValidatorPage__SummaryValue--${tone}` : ''}`}
        aria-busy={Boolean(loading)}
      >
        {loading ? (placeholder ?? <Skeleton w={'75%'} h={'1.2em'} />) : value}
      </div>
      {hint ? (
        <div className={'ValidatorPage__SummaryHint'}>
          {loading ? <Skeleton w={'60%'} h={'0.8em'} /> : hint}
        </div>
      ) : null}
    </InfoContainer>
  )
}

function Validator({ hash }: ValidatorProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [validator, setValidator] = useState<LoadableState<ValidatorDetail>>({
    data: {} as ValidatorDetail,
    loading: true,
    error: false
  })
  const [rate, setRate] = useState<LoadableState<Rate>>({
    data: {} as Rate,
    loading: true,
    error: false
  })
  const { l1explorerBaseUrl } = useActiveNetwork()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Validators', path: '/validators' },
      { label: hash, avatar: true }
    ])
  }, [setBreadcrumbs, hash])

  const status = getValidatorStatus(validator.data)
  const posePenalty = Number(validator.data?.proTxInfo?.state?.PoSePenalty)
  const poseKnown = Number.isFinite(posePenalty)
  const poseScoreMax = Number(validator.data?.poseScoreMax)
  const hasPoseScoreMax = Number.isInteger(poseScoreMax) && poseScoreMax > 0
  const poseBanHeight = Number(validator.data?.proTxInfo?.state?.PoSeBanHeight)
  const isPoseBanned = Number.isInteger(poseBanHeight) && poseBanHeight >= 0
  const balance = Number(validator.data?.identityBalance)
  const hasBalance = Number.isFinite(balance) && validator.data?.identityBalance != null
  const epochReward = validator.data?.epochReward
  const epochNumber = validator.data?.epochInfo?.number
  const registeredHeight = Number(validator.data?.proTxInfo?.state?.registeredHeight)
  const hasRegisteredHeight = Number.isInteger(registeredHeight) && registeredHeight > 0
  const registeredBlockLink = useCoreBlockLink(registeredHeight, l1explorerBaseUrl)
  const bannedBlockLink = useCoreBlockLink(poseBanHeight, l1explorerBaseUrl)
  const countryCode = validator.data?.geoIpInfo?.countryCode
  const region = [validator.data?.geoIpInfo?.city, countryCode].filter(Boolean).join(', ')
  const typeLabel = nodeTypeLabel(validator.data?.proTxInfo?.type)
  const totalReward = Number(validator.data?.totalReward)
  const hasTotalReward = validator.data?.totalReward != null && Number.isFinite(totalReward)
  const totalRewardUsd =
    hasTotalReward && typeof rate.data?.usd === 'number'
      ? (creditsToDash(totalReward) * rate.data.usd).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })
      : null

  useEffect(() => {
    let cancelled = false
    const loadValidator = (first: boolean) => {
      if (first) setValidator(state => ({ ...state, loading: true, error: false }))
      Api.getValidatorByProTxHash(hash)
        .then(res => {
          if (!cancelled) fetchHandlerSuccess(setValidator, res as Partial<ValidatorDetail>)
        })
        .catch(err => {
          if (!cancelled && first) fetchHandlerError(setValidator, err)
        })
    }
    loadValidator(true)
    const refresh = window.setInterval(() => loadValidator(false), 60000)
    Api.getRate()
      .then(res => {
        if (!cancelled) fetchHandlerSuccess(setRate, res)
      })
      .catch(err => {
        if (!cancelled) fetchHandlerError(setRate, err)
      })
    return () => {
      cancelled = true
      window.clearInterval(refresh)
    }
  }, [hash])

  const proTxState = validator.data?.proTxInfo?.state
  const ownerVotes =
    !!proTxState?.ownerAddress && proTxState.ownerAddress === proTxState.votingAddress
  const collateralBadge = validator.data?.proTxInfo?.type
    ? `${validator.data.proTxInfo.type.toLowerCase() === 'evo' ? '4,000' : '1,000'} DASH`
    : ''
  const votingBadge =
    validator.data?.votingIdentityBalance != null
      ? `${dashAmount(Number(validator.data.votingIdentityBalance))} DASH`
      : ''
  const keyRows = [
    {
      key: 'payout',
      label: 'Payout',
      extra: '',
      value: proTxState?.payoutAddress || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={'Payout'}
          value={
            <KeyIdentifier
              value={proTxState?.payoutAddress || ''}
              href={
                l1explorerBaseUrl
                  ? getL1ExplorerLink(l1explorerBaseUrl, 'address', proTxState?.payoutAddress)
                  : '#'
              }
              external={true}
            />
          }
          loading={validator.loading}
          error={validator.error || !proTxState?.payoutAddress}
        />
      )
    },
    {
      key: 'collateral',
      label: 'Collateral',
      extra: collateralBadge,
      value: validator.data?.proTxInfo?.collateralAddress || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={
            <span className={'ValidatorPage__StatusLabel'}>
              Collateral
              {collateralBadge ? (
                <Badge
                  size={'xs'}
                  colorScheme={
                    validator.data?.proTxInfo?.type?.toLowerCase() === 'evo' ? 'blue' : 'orange'
                  }
                >
                  {collateralBadge}
                </Badge>
              ) : null}
            </span>
          }
          value={
            <KeyIdentifier
              value={validator.data?.proTxInfo?.collateralAddress || ''}
              href={
                l1explorerBaseUrl
                  ? getL1ExplorerLink(l1explorerBaseUrl, 'address', validator.data?.proTxInfo?.collateralAddress)
                  : '#'
              }
              external={true}
            />
          }
          loading={validator.loading}
          error={validator.error || !validator.data?.proTxInfo?.collateralAddress}
        />
      )
    },
    {
      key: 'owner',
      label: ownerVotes ? 'Owner, voting' : 'Owner',
      extra: ownerVotes ? votingBadge : '',
      value: proTxState?.ownerAddress || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={
            <span className={'ValidatorPage__StatusLabel'}>
              {ownerVotes ? 'Owner, voting' : 'Owner'}
              {ownerVotes && votingBadge ? (
                <Badge size={'xs'} colorScheme={'blue'}>
                  {votingBadge}
                </Badge>
              ) : null}
            </span>
          }
          value={
            <KeyIdentifier
              value={proTxState?.ownerAddress || ''}
              href={
                getL1ExplorerLink(l1explorerBaseUrl, 'address', proTxState?.ownerAddress)
              }
              external={true}
            />
          }
          loading={validator.loading}
          error={validator.error || !proTxState?.ownerAddress}
        />
      )
    },
    ...(!ownerVotes && proTxState?.votingAddress
      ? [
          {
            key: 'voting',
            label: 'Voting',
            extra: votingBadge,
            value: proTxState.votingAddress,
            line: (
              <InfoLine
                className={'ValidatorPage__Key'}
                postfix={''}
                title={
                  <span className={'ValidatorPage__StatusLabel'}>
                    Voting
                    {votingBadge ? (
                      <Badge size={'xs'} colorScheme={'blue'}>
                        {votingBadge}
                      </Badge>
                    ) : null}
                  </span>
                }
                value={
                  <KeyIdentifier
                    value={proTxState.votingAddress}
                    href={
                      l1explorerBaseUrl
                        ? getL1ExplorerLink(l1explorerBaseUrl, 'address', proTxState.votingAddress)
                        : '#'
                    }
                    external={true}
                  />
                }
                loading={validator.loading}
                error={!proTxState.votingAddress}
              />
            )
          }
        ]
      : []),
    {
      key: 'identity',
      label: 'Identity',
      extra: '',
      value: validator.data?.identity || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={'Identity'}
          value={
            <KeyIdentifier
              value={validator.data?.identity || ''}
              href={`/identity/${validator.data?.identity || ''}`}
            />
          }
          loading={validator.loading}
          error={validator.error || !validator.data?.identity}
        />
      )
    },
    {
      key: 'registration',
      label: 'Registration',
      extra: '',
      value: validator.data?.proTxHash || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={'Registration'}
          value={
            <KeyIdentifier
              value={validator.data?.proTxHash || ''}
              href={
                l1explorerBaseUrl
                  ? getL1ExplorerLink(l1explorerBaseUrl, 'transaction', validator.data?.proTxHash)
                  : undefined
              }
              external={true}
            />
          }
          loading={validator.loading}
          error={validator.error || !validator.data?.proTxHash}
        />
      )
    },
    {
      key: 'node',
      label: 'Node ID',
      extra: '',
      value: proTxState?.platformNodeID || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={'Node ID'}
          value={<KeyIdentifier value={proTxState?.platformNodeID || ''} />}
          loading={validator.loading}
          error={validator.error || !proTxState?.platformNodeID}
        />
      )
    },
    {
      key: 'operator',
      label: 'Operator',
      extra: '',
      value: proTxState?.pubKeyOperator || '',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={'Operator'}
          value={<KeyIdentifier value={proTxState?.pubKeyOperator || ''} />}
          loading={validator.loading}
          error={validator.error || !proTxState?.pubKeyOperator}
        />
      )
    }
  ].sort(
    (a, b) =>
      a.label.length +
      a.extra.length +
      a.value.length -
      (b.label.length + b.extra.length + b.value.length)
  )

  return (
    <PageDataContainer className={'ValidatorPage'} title={'Validator Info'}>
      <div className={'ValidatorPage__ContentContainer'}>
        <div className={'ValidatorPage__Column'}>
          <InfoContainer className={'ValidatorPage__Group ValidatorPage__Service'}>
            <div className={'ValidatorPage__ServiceBody'}>
              <div className={'ValidatorPage__ServiceMain'}>
                <div className={'ValidatorPage__ServiceRow'}>
                  <div className={'ValidatorPage__ServiceRowTitle'}>Service</div>
                  <div className={'ValidatorPage__ServiceRowValue'}>
                    <div className={'ValidatorPage__ServiceHead'}>
                      {validator.loading ? (
                        <span className={'ValidatorPage__ServiceHost'}>…</span>
                      ) : validator.error || !validator.data?.endpoints?.coreP2PPortStatus?.host ? (
                        <NotActive />
                      ) : (
                        <HostWithFlag
                          host={validator.data.endpoints.coreP2PPortStatus.host}
                          countryCode={countryCode}
                          place={region}
                        />
                      )}
                    </div>
                    <div className={'ValidatorPage__Ports'}>
                      {(
                        [
                          {
                            key: 'core',
                            label: 'Core',
                            endpoint: validator.data?.endpoints?.coreP2PPortStatus,
                            link: null
                          },
                          {
                            key: 'platform',
                            label: 'Platform',
                            endpoint: validator.data?.endpoints?.platformP2PPortStatus,
                            link: null
                          },
                          {
                            key: 'grpc',
                            label: 'gRPC',
                            endpoint: validator.data?.endpoints?.platformGrpcPortStatus,
                            link: validator.data?.endpoints?.platformGrpcPortStatus?.host
                              ? `https://${validator.data.endpoints.platformGrpcPortStatus.host}${
                                  validator.data.endpoints.platformGrpcPortStatus.port
                                    ? ':' + validator.data.endpoints.platformGrpcPortStatus.port
                                    : ''
                                }`
                              : null
                          }
                        ] as const
                      ).map(item => {
                        const status = item.endpoint?.status || 'UNKNOWN'
                        const color =
                          status === 'OK'
                            ? 'green.label'
                            : status === 'UNKNOWN'
                              ? 'yellow.default'
                              : 'red.default'
                        const content = (
                          <>
                            <CircleIcon w={'8px'} h={'8px'} color={color} />
                            <span className={'ValidatorPage__PortName'}>
                              {item.label} :{item.endpoint?.port || '—'}
                            </span>
                          </>
                        )
                        return item.link ? (
                          <a
                            key={item.key}
                            className={'ValidatorPage__Port'}
                            href={item.link}
                            target={'_blank'}
                            rel={'noreferrer'}
                            title={item.endpoint?.message || undefined}
                          >
                            {content}
                          </a>
                        ) : (
                          <span
                            key={item.key}
                            className={'ValidatorPage__Port'}
                            title={item.endpoint?.message || undefined}
                          >
                            {content}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </InfoContainer>

          <EarningsCard
            loading={validator.loading}
            hash={hash}
            blocksUntilCorePayment={validator.data?.blocksUntilCorePayment}
            coreTipTime={validator.data?.coreTipTime}
            coreBlockIntervalMs={validator.data?.coreBlockIntervalMs}
            banned={Number(validator.data?.proTxInfo?.state?.PoSeBanHeight) >= 0}
          />

          <InfoContainer className={'ValidatorPage__Group ValidatorPage__Ledger'}>
            {keyRows.map(row => (
              <Fragment key={row.key}>{row.line}</Fragment>
            ))}
          </InfoContainer>
        </div>

        <div className={'ValidatorPage__Column'}>
          <InfoContainer className={'ValidatorPage__Epochs'}>
            <ValidatorEpochs
              hash={hash}
              epochNumber={typeof epochNumber === 'number' ? epochNumber : null}
              epochStart={validator.data?.epochInfo?.startTime ?? null}
              epochEnd={validator.data?.epochInfo?.endTime ?? null}
              epochReward={
                validator.loading || validator.error || epochReward == null ? null : epochReward
              }
            />
          </InfoContainer>
          <div className={'ValidatorPage__Summary'}>
            <SummaryCard
              label={
                <span className={'ValidatorPage__StatusLabel'}>
                  Status
                  {!validator.loading && !validator.error && typeLabel ? (
                    <Badge size={'xs'} colorScheme={typeLabel === 'Evonode' ? 'blue' : 'orange'}>
                      {typeLabel}
                    </Badge>
                  ) : null}
                </span>
              }
              loading={validator.loading}
              tone={validator.error ? undefined : status.colorScheme}
              value={validator.error ? <NotActive /> : status.label}
              hint={
                !validator.loading && !validator.error ? (
                  <span className={'ValidatorPage__StatusHint'}>
                    {poseKnown ? (
                      isPoseBanned && bannedBlockLink ? (
                        <a
                          className={'ValidatorPage__PoseLink'}
                          href={bannedBlockLink}
                          target={'_blank'}
                          rel={'noreferrer'}
                        >
                          Proof of Service {posePenalty.toLocaleString('en-US')}
                          {hasPoseScoreMax ? ` / ${poseScoreMax.toLocaleString('en-US')}` : ''}
                        </a>
                      ) : (
                        <span>
                          Proof of Service {posePenalty.toLocaleString('en-US')}
                          {hasPoseScoreMax ? ` / ${poseScoreMax.toLocaleString('en-US')}` : ''}
                        </span>
                      )
                    ) : null}
                  </span>
                ) : null
              }
            />
            <SummaryCard
              label={'Last proposed'}
              loading={validator.loading}
              value={
                validator.error || !validator.data?.lastProposedBlockHeader?.timestamp ? (
                  <NotActive />
                ) : (
                  <DateBlock
                    timestamp={validator.data.lastProposedBlockHeader.timestamp}
                    format={'deltaOnly'}
                  />
                )
              }
              hint={
                validator.data?.lastProposedBlockHeader?.hash ? (
                  <Link href={`/block/${validator.data.lastProposedBlockHeader.hash}`}>
                    {typeof validator.data.lastProposedBlockHeader.height === 'number'
                      ? `Block ${validator.data.lastProposedBlockHeader.height.toLocaleString('en-US')}`
                      : 'View block'}
                  </Link>
                ) : null
              }
            />
            <SummaryCard
              label={'Balance Identity'}
              loading={validator.loading}
              value={hasBalance && !validator.error ? `${dashAmount(balance)} DASH` : <NotActive />}
              hint={
                validator.loading || validator.error
                  ? null
                  : `Voting · ${
                      validator.data?.votingIdentityBalance != null
                        ? `${dashAmount(Number(validator.data.votingIdentityBalance))} DASH`
                        : '—'
                    }`
              }
            />
            <SummaryCard
              label={'Indexed transaction fees'}
              loading={validator.loading}
              value={
                hasTotalReward && !validator.error ? (
                  <RateTooltip credits={totalReward} rate={rate.data}>
                    <span>{dashAmount(totalReward)} DASH</span>
                  </RateTooltip>
                ) : (
                  <NotActive />
                )
              }
              hint={
                !validator.loading && !validator.error
                  ? `All time${totalRewardUsd ? ` · ${totalRewardUsd}` : ''}`
                  : null
              }
            />
            <WithdrawalsCard
              identity={validator.error ? null : validator.data?.identity}
              loading={validator.loading}
            />
            <SummaryCard
              className={'ValidatorPage__RegistrationCard'}
              label={
                <span className={'ValidatorPage__RegistrationHeading'}>
                  Registered
                  {!validator.loading && !validator.error && validator.data?.proTxHash ? (
                    <ImageGenerator
                      className={'ValidatorPage__Identicon'}
                      username={validator.data.proTxHash}
                      lightness={50}
                      saturation={50}
                      width={64}
                      height={64}
                    />
                  ) : null}
                </span>
              }
              loading={validator.loading}
              value={
                validator.error || !validator.data?.registeredAt ? (
                  <NotActive />
                ) : (
                  (() => {
                    const date = new Date(validator.data.registeredAt)
                    if (Number.isNaN(date.getTime())) return <NotActive />
                    return date
                      .toLocaleDateString('en-GB', { timeZone: 'UTC' })
                      .replaceAll('/', '.')
                  })()
                )
              }
              hint={
                hasRegisteredHeight && !validator.error ? (
                  <a
                    className={'ValidatorPage__Registered'}
                    href={registeredBlockLink}
                    target={registeredBlockLink ? '_blank' : undefined}
                    rel={registeredBlockLink ? 'noopener noreferrer' : undefined}
                    title={'Core block where this node was registered'}
                  >
                    <BlockIcon w={'14px'} h={'14px'} />#{registeredHeight.toLocaleString('en-US')}
                  </a>
                ) : null
              }
            />
          </div>
        </div>

        <InfoContainer styles={['tabs']} className={'ValidatorPage__Lists'}>
          <ValidatorActivityLists
            key={hash}
            hash={hash}
            identity={validator.loading ? null : validator.data?.identity}
            votingIdentity={validator.loading ? null : validator.data?.votingIdentity}
            blocksCount={validator.loading ? null : validator.data?.proposedBlocksAmount}
            withdrawalsCount={validator.loading ? null : validator.data?.withdrawalsCount}
            loading={validator.loading}
            error={validator.error}
            rate={rate.data}
            defaultPayoutAddress={validator.data?.proTxInfo?.state?.payoutAddress}
            l1explorerBaseUrl={l1explorerBaseUrl}
          />
        </InfoContainer>
      </div>
    </PageDataContainer>
  )
}

export default Validator
