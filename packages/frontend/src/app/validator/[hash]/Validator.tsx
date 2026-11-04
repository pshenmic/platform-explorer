'use client'
import { Fragment, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { getL1ExplorerLink } from '../../../util/l1Explorer'
import { validatorDashAmount as dashAmount } from '../../../util/validatorAmount'
import {
  fetchHandlerSuccess,
  fetchHandlerError,
  creditsToDash,
  removeTrailingZeros
} from '../../../util'
import { Skeleton } from '../../../components/home/Skeleton'
import ValidatorActivityLists from './ValidatorActivityLists'
import ValidatorEpochs from './ValidatorEpochs'
import ValidatorEarnings from './ValidatorEarnings'
import ValidatorSurface from './ValidatorSurface'
import ValidatorService from './ValidatorService'
import Link from 'next/link'
import Image from 'next/image'
import { Identifier, TimeDelta, InfoLine, NotActive } from '../../../components/data'
import { PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { CopyButton } from '../../../components/ui/Buttons'
import { Badge } from '../../../components/ui/Badge/Badge'
import ImageGenerator from '../../../components/imageGenerator'

import { Tooltip } from '../../../components/ui/Tooltips'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { useActiveNetwork } from 'src/contexts'
import type { Validator as ValidatorType } from '../../../types/Validator'
import type { LoadableState, Rate } from '../../../types'

import { getValidatorStatus } from '../../../components/validators/validatorStatus'
import ValidatorStatus from '../../../components/validators/ValidatorStatusIndicator'

import './ValidatorPage.css'

/** Epoch fields used on the page (API may flatten Epoch onto epochInfo). */
type EpochInfo = {
  number?: number
  startTime?: number | string
  endTime?: number | string
} | null

type ValidatorDetail = Omit<Partial<ValidatorType>, 'epochInfo' | 'endpoints' | 'proTxInfo'> & {
  epochInfo?: EpochInfo
  endpoints?: ValidatorType['endpoints']
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

function KeyIdentifier({
  value,
  href,
  external,
  wrap = false
}: {
  value: string
  href?: string
  external?: boolean
  wrap?: boolean
}) {
  const identifier = (
    <Identifier
      ellipsis={!wrap}
      linesAdjustment={wrap}
      className={wrap ? 'ValidatorPage__BalancedKey' : undefined}
      styles={['highlight-both']}
      copyButton={!href}
    >
      {value}
    </Identifier>
  )

  if (!href) return identifier

  const linked = external ? (
    <a
      className={'ValidatorPage__KeyLink ValidatorPage__Link'}
      href={href}
      target={'_blank'}
      rel={'noopener noreferrer'}
    >
      {identifier}
    </a>
  ) : (
    <Link className={'ValidatorPage__KeyLink ValidatorPage__Link'} href={href}>
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

function WithdrawalsBadge({ identity, loading }: { identity?: string | null; loading: boolean }) {
  const query = useQuery({
    queryKey: ['identity-withdrawals', identity],
    enabled: Boolean(identity),
    staleTime: 60000,
    retry: 1,
    queryFn: () => Api.getWithdrawalsByIdentity(identity as string, 1, 100, 'desc')
  })
  const rows = query.data?.resultSet ?? []
  const completed = rows.filter(row => row.status === 'COMPLETE')
  const total = completed.reduce<number | null>((sum, row) => {
    const amount = row.amount == null ? NaN : Number(row.amount)
    return sum == null || !Number.isFinite(amount) || amount < 0 ? null : sum + amount
  }, 0)
  const pending = loading || (Boolean(identity) && query.isPending)
  const amount =
    query.isError || !identity || total == null || !Number.isFinite(total)
      ? 'Unavailable'
      : `${dashAmount(total)} DASH`
  return (
    <a
      href="#withdrawals"
      className="ValidatorPage__WithdrawalsBadge"
      aria-label={`Withdrawn to Core: ${pending ? 'loading' : amount}. View history.`}
    >
      <Badge
        size="xs"
        className="ValidatorPage__AmountBadge"
        colorScheme={
          !pending &&
          !query.isError &&
          identity &&
          total != null &&
          Number.isFinite(total) &&
          total > 0
            ? 'red'
            : 'dimGray'
        }
      >
        {pending ? <Skeleton w={64} h="1em" /> : amount}
      </Badge>
    </a>
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
  const poseValue = validator.data?.proTxInfo?.state?.PoSePenalty
  const posePenalty = Number(poseValue)
  const poseKnown = poseValue != null && Number.isFinite(posePenalty) && posePenalty >= 0
  const poseScoreMax = Number(validator.data?.poseScoreMax)
  const hasPoseScoreMax = Number.isInteger(poseScoreMax) && poseScoreMax > 0
  const isPoseBanned = status.key === 'banned'
  const balance = Number(validator.data?.identityBalance)
  const hasBalance = Number.isFinite(balance) && validator.data?.identityBalance != null
  const registeredDate = validator.data?.registeredAt ? new Date(validator.data.registeredAt) : null
  const registrationDate =
    registeredDate && Number.isFinite(registeredDate.getTime())
      ? registeredDate.toLocaleDateString('en-GB', { timeZone: 'UTC' }).replaceAll('/', '.')
      : null
  const registeredBlockLink = getL1ExplorerLink(
    l1explorerBaseUrl,
    'block',
    validator.data?.registeredCoreBlockHash
  )
  const bannedBlockLink = getL1ExplorerLink(
    l1explorerBaseUrl,
    'block',
    validator.data?.poseBanCoreBlockHash
  )
  const countryCode = validator.data?.geoIpInfo?.countryCode
  const country = countryCode?.trim().toLowerCase()
  const host = validator.error ? null : validator.data?.endpoints?.coreP2PPortStatus?.host
  const region = [validator.data?.geoIpInfo?.city, countryCode].filter(Boolean).join(', ')

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
      key: 'service',
      line: (
        <ValidatorService
          endpoints={validator.error ? null : validator.data?.endpoints}
          loading={validator.loading}
          error={Boolean(validator.error)}
        />
      )
    },
    {
      key: 'registration',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow ValidatorPage__RegistrationRow"
          postfix=""
          title="Registration"
          loading={validator.loading}
          error={validator.error}
          value={
            <span className="ValidatorPage__RegistrationDetails">
              <Tooltip
                className="ValidatorPage__Tooltip"
                content={
                  registrationDate
                    ? `${registrationDate} (UTC)`
                    : 'Registration date not returned by the API'
                }
              >
                {registrationDate && registeredBlockLink ? (
                  <a
                    className="ValidatorPage__Registered ValidatorPage__Link"
                    href={registeredBlockLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TimeDelta endDate={registeredDate} showTimestampTooltip={false} />
                  </a>
                ) : (
                  <span className="ValidatorPage__Registered ValidatorPage__Help" tabIndex={0}>
                    {registrationDate ? (
                      <TimeDelta endDate={registeredDate} showTimestampTooltip={false} />
                    ) : (
                      'Unavailable'
                    )}
                  </span>
                )}
              </Tooltip>
            </span>
          }
        />
      )
    },
    {
      key: 'quorum',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow"
          postfix=""
          title="Status"
          loading={validator.loading}
          value={<ValidatorStatus status={status} unavailable={Boolean(validator.error)} />}
        />
      )
    },
    {
      key: 'pose',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow"
          postfix=""
          title={
            <Tooltip
              className="ValidatorPage__Tooltip"
              content="Proof of Service penalty, not a health percentage. Lower is better; the limit depends on the masternode list size."
            >
              <span tabIndex={0}>PoSe ⓘ</span>
            </Tooltip>
          }
          loading={validator.loading}
          error={validator.error}
          value={
            validator.error || !poseKnown ? (
              'Unavailable'
            ) : (
              <span className="ValidatorPage__PoseValue">
                {isPoseBanned && bannedBlockLink ? (
                  <a
                    className="ValidatorPage__Link"
                    href={bannedBlockLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {posePenalty.toLocaleString('en-US')}
                  </a>
                ) : (
                  posePenalty.toLocaleString('en-US')
                )}
                {hasPoseScoreMax ? ` / ${poseScoreMax.toLocaleString('en-US')}` : ''}
              </span>
            )
          }
        />
      )
    },
    {
      key: 'payout',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title="Payout"
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
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title=""
          value={
            <KeyIdentifier
              value={validator.data?.proTxInfo?.collateralAddress || ''}
              href={
                l1explorerBaseUrl
                  ? getL1ExplorerLink(
                      l1explorerBaseUrl,
                      'address',
                      validator.data?.proTxInfo?.collateralAddress
                    )
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
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title={
            <span className={'ValidatorPage__StatusLabel'}>
              {ownerVotes ? 'Owner, voting' : 'Owner'}
              {ownerVotes && votingBadge ? (
                <Badge
                  size="xs"
                  className="ValidatorPage__AmountBadge"
                  title={`${validator.data?.votingIdentityBalance} CREDITS`}
                  colorScheme={
                    Number(validator.data?.votingIdentityBalance) > 0 ? 'blue' : 'dimGray'
                  }
                >
                  {votingBadge}
                </Badge>
              ) : null}
            </span>
          }
          value={
            <KeyIdentifier
              value={proTxState?.ownerAddress || ''}
              href={getL1ExplorerLink(l1explorerBaseUrl, 'address', proTxState?.ownerAddress)}
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
            line: (
              <InfoLine
                className={'ValidatorPage__Key'}
                postfix={''}
                title={
                  <span className={'ValidatorPage__StatusLabel'}>
                    Voting
                    {votingBadge ? (
                      <Badge
                        size="xs"
                        className="ValidatorPage__AmountBadge"
                        title={`${validator.data?.votingIdentityBalance} CREDITS`}
                        colorScheme={
                          Number(validator.data?.votingIdentityBalance) > 0 ? 'blue' : 'dimGray'
                        }
                      >
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
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title="Identity"
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
      key: 'votingIdentity',
      line: (
        <InfoLine
          className="ValidatorPage__Key"
          postfix=""
          title="Voting identity"
          value={
            validator.data?.votingIdentity ? (
              <KeyIdentifier
                value={validator.data.votingIdentity}
                href={`/identity/${validator.data.votingIdentity}`}
              />
            ) : (
              <NotActive />
            )
          }
          loading={validator.loading}
          error={validator.error}
        />
      )
    },
    {
      key: 'proTxHash',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__ProTxHashRow ValidatorPage__CompactRow"
          postfix={''}
          title="ProTxHash"
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
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title="Evonode ID"
          value={<KeyIdentifier value={proTxState?.platformNodeID || ''} />}
          loading={validator.loading}
          error={validator.error || !proTxState?.platformNodeID}
        />
      )
    },
    {
      key: 'lastBlock',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow"
          postfix=""
          title="Last proposed"
          loading={validator.loading}
          error={validator.error}
          value={
            validator.data?.lastProposedBlockHeader?.hash ? (
              <Link
                className="ValidatorPage__Link ValidatorPage__ActivityValue"
                href={`/block/${validator.data.lastProposedBlockHeader.hash}`}
              >
                <TimeDelta endDate={validator.data.lastProposedBlockHeader.timestamp} />
              </Link>
            ) : (
              'Unavailable'
            )
          }
        />
      )
    },
    {
      key: 'withdrawn',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow"
          postfix=""
          title="Withdrawn to Core"
          loading={validator.loading}
          error={validator.error}
          value={
            <WithdrawalsBadge
              identity={validator.error ? null : validator.data?.identity}
              loading={validator.loading}
            />
          }
        />
      )
    },
    {
      key: 'lastWithdrawal',
      line: (
        <InfoLine
          className="ValidatorPage__Key ValidatorPage__CompactRow"
          postfix=""
          title="Last withdrawal"
          loading={validator.loading}
          error={validator.error}
          value={
            validator.data?.lastWithdrawal ? (
              <Link
                className="ValidatorPage__Link"
                href={`/transaction/${validator.data.lastWithdrawal}`}
              >
                {validator.data.lastWithdrawalTime ? (
                  <TimeDelta endDate={validator.data.lastWithdrawalTime} />
                ) : (
                  'View transaction'
                )}
              </Link>
            ) : validator.data?.withdrawalsCount === 0 ? (
              'No withdrawals'
            ) : (
              'Unavailable'
            )
          }
        />
      )
    },
    {
      key: 'operator',
      line: (
        <InfoLine
          className={'ValidatorPage__Key'}
          postfix={''}
          title="Operator"
          value={<KeyIdentifier value={proTxState?.pubKeyOperator || ''} wrap />}
          loading={validator.loading}
          error={validator.error || !proTxState?.pubKeyOperator}
        />
      )
    }
  ]
  const profileKeys = ['proTxHash', 'registration', 'identity', 'service']
  const stateKeys = ['node', 'votingIdentity', 'quorum', 'pose']
  const detailKeys = ['payout', 'owner', 'voting', 'operator']
  const activityKeys = ['withdrawn', 'lastWithdrawal', 'lastBlock']
  const profileRows = profileKeys.flatMap(key => keyRows.filter(row => row.key === key))
  const stateRows = stateKeys.flatMap(key => keyRows.filter(row => row.key === key))
  const detailRows = detailKeys.flatMap(key => keyRows.filter(row => row.key === key))
  const activityRows = activityKeys.flatMap(key => keyRows.filter(row => row.key === key))

  return (
    <PageDataContainer
      className={'ValidatorPage'}
      title={
        <h1 className="ValidatorPage__Title">
          Validator <Identifier copyButton>{hash}</Identifier>
        </h1>
      }
    >
      <div className={'ValidatorPage__ContentContainer'}>
        <div className="ValidatorPage__Column ValidatorPage__Column--Details">
          <InfoContainer className="ValidatorPage__Group ValidatorPage__Ledger ValidatorPage__Surface ValidatorPage__Surface--profile">
            <ValidatorSurface kind="profile" />
            <h2 className="ValidatorPage__SectionTitle">Validator</h2>
            <div className="ValidatorPage__ProfileIdentifiers">
              <div className="ValidatorPage__ProfileRows">
                {profileRows.map(row => (
                  <Fragment key={row.key}>{row.line}</Fragment>
                ))}
              </div>
              <aside
                className="ValidatorPage__ProfileState"
                aria-label="Validator avatar, balance and IP"
              >
                <ImageGenerator
                  className="ValidatorPage__ProfileAvatar"
                  username={hash}
                  lightness={50}
                  saturation={50}
                  width={88}
                  height={88}
                />
                <div className="ValidatorPage__ProfileBalance">
                  <Tooltip
                    className="ValidatorPage__Tooltip"
                    title="Identity balance"
                    content={
                      hasBalance && !validator.error && !validator.loading ? (
                        <>
                          {removeTrailingZeros(creditsToDash(balance).toFixed(8))} DASH
                          <br />
                          {validator.data?.identityBalance} CREDITS
                        </>
                      ) : (
                        'Unavailable'
                      )
                    }
                  >
                    <Badge
                      size="xs"
                      colorScheme={
                        !validator.error && hasBalance && balance > 0 ? 'blue' : 'dimGray'
                      }
                      className="ValidatorPage__AmountBadge ValidatorPage__Help"
                      tabIndex={0}
                      aria-label="Platform identity balance"
                    >
                      {validator.loading ? (
                        <Skeleton w={64} h="1em" />
                      ) : hasBalance && !validator.error ? (
                        `${dashAmount(balance)} DASH`
                      ) : (
                        'Unavailable'
                      )}
                    </Badge>
                  </Tooltip>
                </div>
                {validator.loading ? (
                  <Skeleton w={88} h="1em" />
                ) : (
                  <div className="ValidatorPage__ProfileIp" aria-label="IP address">
                    {country && /^[a-z]{2}$/.test(country) && host && (
                      <Image
                        className="ValidatorPage__Flag"
                        src={`/flags/circle/${country}.svg`}
                        alt=""
                        title={region}
                        width={16}
                        height={16}
                      />
                    )}
                    <span className="ValidatorPage__ProfileIpAddress">
                      <span>{host || 'Unavailable'}</span>
                    </span>
                    {host && <CopyButton className="Identifier__CopyButton" text={host} />}
                  </div>
                )}
              </aside>
            </div>
          </InfoContainer>
          <InfoContainer className="ValidatorPage__Group ValidatorPage__Ledger ValidatorPage__Surface ValidatorPage__Surface--participation">
            <ValidatorSurface kind="participation" />
            <h2 className="ValidatorPage__SectionTitle">Participation</h2>
            <section className="ValidatorPage__ProfileDetails" aria-label="Participation">
              {stateRows.map(row => (
                <Fragment key={row.key}>{row.line}</Fragment>
              ))}
            </section>
          </InfoContainer>
          <InfoContainer className="ValidatorPage__Group ValidatorPage__Ledger ValidatorPage__Surface ValidatorPage__Surface--ownership">
            <ValidatorSurface kind="ownership" />
            <h2 className="ValidatorPage__SectionTitle">Ownership &amp; payments</h2>
            <section className="ValidatorPage__ProfileDetails" aria-label="Addresses and keys">
              {detailRows.map(row => (
                <Fragment key={row.key}>{row.line}</Fragment>
              ))}
            </section>
          </InfoContainer>
        </div>

        <div className="ValidatorPage__Column ValidatorPage__Column--Metrics">
          <InfoContainer className={'ValidatorPage__Epochs'}>
            <ValidatorEpochs
              hash={hash}
              payouts={{
                total: validator.data?.totalReward,
                loading: validator.loading,
                error: Boolean(validator.error)
              }}
            />
          </InfoContainer>
          <ValidatorEarnings
            loading={validator.loading}
            nodeType={validator.data?.proTxInfo?.type}
            hash={hash}
            blocksUntilCorePayment={validator.data?.blocksUntilCorePayment}
            coreTipTime={validator.data?.coreTipTime}
            coreBlockIntervalMs={validator.data?.coreBlockIntervalMs}
            banned={isPoseBanned}
            collateral={keyRows.find(row => row.key === 'collateral')?.line}
            collateralAmount={validator.error ? '' : collateralBadge}
            activity={activityRows.map(row => <div key={row.key}>{row.line}</div>)}
          />
        </div>

        <InfoContainer styles={['tabs']} className={'ValidatorPage__Lists'}>
          <ValidatorActivityLists
            key={hash}
            hash={hash}
            identity={validator.loading ? null : validator.data?.identity}
            votingIdentity={validator.loading ? null : validator.data?.votingIdentity}
            blocksCount={validator.loading ? null : validator.data?.proposedBlocksAmount}
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
