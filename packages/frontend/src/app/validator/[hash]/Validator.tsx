'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import ValidatorActivityLists from './ValidatorActivityLists'
import ValidatorCharts from './ValidatorCharts'
import Link from 'next/link'
import {
  Identifier,
  DateBlock,
  Endpoint,
  IpAddress,
  InfoLine,
  BigNumber,
  TimeDelta
} from '../../../components/data'
import { ValueContainer, PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { ValidatorCard } from '../../../components/validators'
import { CircleIcon } from '../../../components/ui/icons'
import { RateTooltip } from '../../../components/ui/Tooltips'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { Badge } from '../../../components/ui/Badge'
import { useActiveNetwork } from 'src/contexts'
import type { LoadableState, Rate, Validator as ValidatorType } from '../../../types'

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
    collateralAddress?: string | null
    state?: {
      PoSeBanHeight?: number
      PoSeRevivedHeight?: number
      PoSePenalty?: number
      ownerAddress?: string
      votingAddress?: string
      payoutAddress?: string
      pubKeyOperator?: string
    } | null
  } | null
}

interface ValidatorProps {
  hash: string
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

  const poseBanHeight = validator.data?.proTxInfo?.state?.PoSeBanHeight ?? 0
  const posePenalty = validator.data?.proTxInfo?.state?.PoSePenalty ?? 0
  const poseStatusColor =
    poseBanHeight > 0 && validator.data?.proTxInfo?.state?.PoSeRevivedHeight === -1
      ? 'red.default'
      : posePenalty > 0
        ? 'yellow.default'
        : 'green.default'

  useEffect(() => {
    let cancelled = false
    setValidator(state => ({ ...state, loading: true, error: false }))
    Api.getValidatorByProTxHash(hash)
      .then(res => {
        if (!cancelled) fetchHandlerSuccess(setValidator, res as Partial<ValidatorDetail>)
      })
      .catch(err => {
        if (!cancelled) fetchHandlerError(setValidator, err)
      })
    Api.getRate()
      .then(res => {
        if (!cancelled) fetchHandlerSuccess(setRate, res)
      })
      .catch(err => {
        if (!cancelled) fetchHandlerError(setRate, err)
      })
    return () => {
      cancelled = true
    }
  }, [hash])

  return (
    <PageDataContainer className={'ValidatorPage'} title={'Validator Info'}>
      <div className={'ValidatorPage__ContentContainer'}>
        <div className={'ValidatorPage__Column'}>
          <InfoContainer className={'ValidatorPage__GroupContainer'}>
            <ValidatorCard
              validator={validator as LoadableState<ValidatorType>}
              rate={rate.data}
              className={'ValidatorPage__Card'}
            />

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'CORE P2P'}
                value={
                  <Endpoint
                    value={
                      <IpAddress
                        host={validator.data?.endpoints?.coreP2PPortStatus?.host}
                        port={validator.data?.endpoints?.coreP2PPortStatus?.port}
                      />
                    }
                    status={validator.data?.endpoints?.coreP2PPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.coreP2PPortStatus?.message}
                  />
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.coreP2PPortStatus}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform P2P'}
                value={
                  <Endpoint
                    value={
                      <IpAddress
                        host={validator.data?.endpoints?.platformP2PPortStatus?.host}
                        port={validator.data?.endpoints?.platformP2PPortStatus?.port}
                      />
                    }
                    status={validator.data?.endpoints?.platformP2PPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.platformP2PPortStatus?.message}
                  />
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.platformP2PPortStatus}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform GRPC'}
                value={
                  <Endpoint
                    value={
                      <IpAddress
                        host={validator.data?.endpoints?.platformGrpcPortStatus?.host}
                        port={validator.data?.endpoints?.platformGrpcPortStatus?.port}
                      />
                    }
                    status={validator.data?.endpoints?.platformGrpcPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.platformGrpcPortStatus?.message}
                    link={`https://${validator.data?.endpoints?.platformGrpcPortStatus?.host}${
                      validator.data?.endpoints?.platformGrpcPortStatus?.port
                        ? ':' + validator.data?.endpoints?.platformGrpcPortStatus?.port
                        : ''
                    }`}
                  />
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.platformGrpcPortStatus}
              />
            </div>

            <HorisontalSeparator />

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Status'}
                value={
                  <Badge colorScheme={validator?.data?.isActive ? 'green' : 'orange'}>
                    {validator?.data?.isActive ? 'Proposing' : 'Waiting for Quorum'}
                  </Badge>
                }
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Epoch'}
                value={`#${validator.data?.epochInfo?.number}`}
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.number}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Next epoch starts in'}
                value={
                  <TimeDelta endDate={validator.data?.epochInfo?.endTime} format={'detailed'} />
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.endTime}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Rewards This Epoch'}
                value={
                  <RateTooltip credits={validator.data?.epochReward ?? undefined} rate={rate.data}>
                    <span>
                      <BigNumber>{validator.data?.epochReward}</BigNumber>
                    </span>
                  </RateTooltip>
                }
                loading={validator.loading}
                error={validator.error || !(typeof validator.data?.epochReward === 'number')}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Total Rewards Earned'}
                value={
                  <RateTooltip credits={validator.data?.totalReward ?? undefined} rate={rate.data}>
                    <span>
                      <BigNumber>{validator.data?.totalReward}</BigNumber>
                    </span>
                  </RateTooltip>
                }
                loading={validator.loading}
                error={validator.error || !(typeof validator.data?.totalReward === 'number')}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Blocks Proposed'}
                value={validator.data?.proposedBlocksAmount}
                loading={validator.loading}
                error={validator.error || typeof validator.data?.proposedBlocksAmount !== 'number'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Proposed Block'}
                value={
                  <Link href={`/block/${validator.data?.lastProposedBlockHeader?.hash}`}>
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                      {validator.data?.lastProposedBlockHeader?.timestamp && (
                        <DateBlock
                          timestamp={validator.data.lastProposedBlockHeader.timestamp}
                          format={'deltaOnly'}
                        />
                      )}
                      <Identifier ellipsis={false} styles={['highlight-both']}>
                        {validator.data?.lastProposedBlockHeader?.hash || ''}
                      </Identifier>
                    </ValueContainer>
                  </Link>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.lastProposedBlockHeader?.hash}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Withdrawals Count'}
                value={validator.data?.withdrawalsCount}
                loading={validator.loading}
                error={validator.error || typeof validator.data?.withdrawalsCount !== 'number'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Withdrawal'}
                value={
                  <Link href={`/transaction/${validator.data?.lastWithdrawal}`}>
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                      {validator.data?.lastWithdrawalTime && (
                        <DateBlock
                          timestamp={validator.data.lastWithdrawalTime}
                          format={'deltaOnly'}
                        />
                      )}
                      <Identifier ellipsis={false} styles={['highlight-both']}>
                        {validator.data?.lastWithdrawal}
                      </Identifier>
                    </ValueContainer>
                  </Link>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.lastWithdrawal}
              />
            </div>

            <HorisontalSeparator />

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'PoSe Score'}
                value={
                  <div className={'ValidatorPage__PoseScroreValue'}>
                    <span>{validator.data?.proTxInfo?.state?.PoSePenalty}</span>
                    <CircleIcon
                      w={'8px'}
                      h={'8px'}
                      ml={'4px'}
                      mb={'-1px'}
                      color={poseStatusColor}
                    />
                  </div>
                }
                loading={validator.loading}
                error={
                  validator.error ||
                  typeof validator.data?.proTxInfo?.state?.PoSePenalty !== 'number'
                }
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Collateral address'}
                value={
                  <a
                    href={
                      l1explorerBaseUrl
                        ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.collateralAddress}`
                        : '#'
                    }
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer
                      className={'ValidatorPage__ValueContainer'}
                      clickable={true}
                      external={true}
                    >
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.collateralAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.collateralAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Owner address'}
                value={
                  <a
                    href={
                      l1explorerBaseUrl
                        ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.ownerAddress}`
                        : '#'
                    }
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer
                      className={'ValidatorPage__ValueContainer'}
                      clickable={true}
                      external={true}
                    >
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.state?.ownerAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.ownerAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Voting address'}
                value={
                  <a
                    href={
                      l1explorerBaseUrl
                        ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.votingAddress}`
                        : '#'
                    }
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer
                      className={'ValidatorPage__ValueContainer'}
                      clickable={true}
                      external={true}
                    >
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.state?.votingAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.votingAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Payout address'}
                value={
                  <a
                    href={
                      l1explorerBaseUrl
                        ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.payoutAddress}`
                        : '#'
                    }
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer
                      className={'ValidatorPage__ValueContainer'}
                      clickable={true}
                      external={true}
                    >
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.state?.payoutAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.payoutAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Operator Public Key'}
                value={
                  <Identifier copyButton={true} styles={['highlight-both']} ellipsis={false}>
                    {validator.data?.proTxInfo?.state?.pubKeyOperator || ''}
                  </Identifier>
                }
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.pubKeyOperator}
              />
            </div>
          </InfoContainer>
        </div>

        <div className={'ValidatorPage__Column'}>
          <InfoContainer styles={['tabs']} className={'ValidatorPage__ChartsContainer'}>
            <ValidatorCharts key={hash} hash={hash} />
          </InfoContainer>

          <InfoContainer styles={['tabs']} className={'ValidatorPage__Lists'}>
            <ValidatorActivityLists
              key={hash}
              hash={hash}
              identity={validator.loading ? null : validator.data?.identity}
              loading={validator.loading}
              error={validator.error}
              rate={rate.data}
              defaultPayoutAddress={validator.data?.proTxInfo?.state?.payoutAddress}
              l1explorerBaseUrl={l1explorerBaseUrl}
            />
          </InfoContainer>
        </div>
      </div>
    </PageDataContainer>
  )
}

export default Validator
