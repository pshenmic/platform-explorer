import type { ComponentType, ReactNode } from 'react'
import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import { ValueCard as ValueCardJs } from '../cards'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  BigNumber as BigNumberJs,
  CreditsBlock as CreditsBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs
} from '../data'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import TokenEmergencyActionBadge from './TokenEmergencyActionBadge'
import { PriceList } from './prices'

import { getMinTokenPrice } from '../../util'
import { FormattedNumber } from '../ui/FormattedNumber'
import type { LoadableState, Rate, Token } from '../../types'
import type { WithClassName } from '../../types/common'
import type { PriceData } from './prices/PriceListItem'
import './TokenTransitionCard.css'

const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: string | number | null
  rate?: Pick<Rate, 'usd'> | null
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  copyButton?: boolean
  ellipsis?: boolean
}>
const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean | null
  icon?: ReactNode
}>
const ValueCard = ValueCardJs as ComponentType<{
  children?: ReactNode
  link?: string
  className?: string
}>

const fieldsOfTypes: Record<string, string[]> = {
  TOKEN_MINT: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'IssuedToIdentity',
    'PublicNote'
  ],
  TOKEN_TRANSFER: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Recipient',
    'PublicNote'
  ],
  TOKEN_BURN: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
  ],
  TOKEN_FREEZE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_UNFREEZE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_DESTROY_FROZEN_FUNDS: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_CLAIM: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Recipient'
  ],
  TOKEN_EMERGENCY_ACTION: [
    'Action',
    'EmergencyAction',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
  ],
  TOKEN_CONFIG_UPDATE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
  ],
  TOKEN_DIRECT_PURCHASE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Price'
  ],
  TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Price'
  ]
}

/** Token transition payload embedded in state transitions (richer than TokenTransition model). */
export interface TokenTransitionView {
  action?: string | null
  amount?: string | number | null
  tokenId?: string | null
  tokenSymbol?: string | null
  recipient?: string | null
  issuedToIdentityId?: string | null
  identityContractNonce?: string | number | null
  tokenContractPosition?: string | number | null
  dataContractId?: string | null
  price?: string | number | null
  prices?: PriceData[] | null
  publicNote?: string | null
  emergencyAction?: string | null
  data?: unknown
  transitionType?: string | null
  [key: string]: unknown
}

interface TokenTransitionCardProps extends WithClassName {
  transition?: TokenTransitionView | null
  owner?: string | null
  rate?: Pick<Rate, 'usd'> | null
}

const TokenTransitionCard = ({ transition, rate, className }: TokenTransitionCardProps) => {
  const action = transition?.action ?? undefined
  const fields = (action && fieldsOfTypes[action]) || []
  const [token, setToken] = useState<LoadableState<Token>>({
    data: null,
    loading: true,
    error: false
  })

  useEffect(() => {
    const tokensInfo = () => {
      if (transition?.tokenId) {
        Api.getToken(transition.tokenId)
          .then(res => {
            setToken({ data: res, loading: false, error: false })
          })
          .catch(() => {
            setToken(prev => ({ ...prev, loading: false, error: true }))
          })
      }
    }
    tokensInfo()
  }, [transition])

  return (
    <div className={`InfoBlock InfoBlock--Gradient TokenTransitionCard ${className || ''}`}>
      {fields.includes('Action') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Action'}
          title={'Action'}
          value={
            <BatchTypeBadge
              batchType={
                transition?.action !== undefined && transition?.action !== null
                  ? String(transition.action)
                  : ''
              }
            />
          }
          error={transition?.action === undefined}
        />
      )}

      {fields.includes('EmergencyAction') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--EmergencyAction'}
          title={'Emergency Action'}
          value={<TokenEmergencyActionBadge type={transition?.emergencyAction} />}
          error={transition?.emergencyAction === undefined}
        />
      )}

      {fields.includes('Amount') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Amount'}
          title={'Amount'}
          value={
            <span className={'TokenTransitionCard__AmountBadge'}>
              <FormattedNumber decimals={token.data?.decimals ?? undefined}>
                {transition?.amount || '0'}
              </FormattedNumber>
              <span>{transition?.tokenSymbol || 'TOKEN'}</span>
            </span>
          }
          loading={token.loading}
          error={transition?.amount === undefined}
        />
      )}

      {fields.includes('TokenId') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--TokenId'}
          title={'Token ID'}
          value={
            <ValueCard>
              <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.tokenId}
              </Identifier>
            </ValueCard>
          }
          error={!transition?.tokenId}
        />
      )}

      {fields.includes('Recipient') && transition?.recipient && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Recipient'}
          title={'Recipient'}
          value={
            <ValueCard link={`/identity/${transition?.recipient}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition?.recipient}
              </Identifier>
            </ValueCard>
          }
        />
      )}

      {fields.includes('IssuedToIdentity') && (
        <InfoLine
          className={
            'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--IssuedToIdentity'
          }
          title={'Issued to Identity ID'}
          value={
            <ValueCard link={`/identity/${transition?.issuedToIdentityId}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition?.issuedToIdentityId}
              </Identifier>
            </ValueCard>
          }
          error={!transition?.issuedToIdentityId}
        />
      )}

      {fields.includes('IdentityContractNonce') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Nonce'}
          title={'Identity Contract Nonce'}
          value={transition?.identityContractNonce}
          error={transition?.identityContractNonce === undefined}
        />
      )}

      {fields.includes('TokenContractPosition') && (
        <InfoLine
          className={
            'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--TokenContractPosition'
          }
          title={'Token Contract Position'}
          value={transition?.tokenContractPosition}
          error={
            transition?.tokenContractPosition === undefined ||
            transition?.tokenContractPosition === null
          }
        />
      )}

      {fields.includes('DataContractId') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--DataContractId'}
          title={'Data Contract ID'}
          value={
            <ValueCard link={`/dataContract/${transition?.dataContractId}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition?.dataContractId}
              </Identifier>
            </ValueCard>
          }
          error={!transition?.dataContractId}
        />
      )}

      {fields.includes('Price') && (
        <>
          <InfoLine
            className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Price'}
            title={'Price'}
            value={
              transition?.price != null ? (
                <CreditsBlock credits={transition?.price} rate={rate} />
              ) : transition?.prices != null && transition?.prices?.length > 0 ? (
                <span className={'TokenTransitionCard__PriceFrom'}>
                  From{' '}
                  <BigNumber>
                    {getMinTokenPrice(
                      transition?.prices as Array<{ price: string | number }> | null | undefined
                    )}
                  </BigNumber>{' '}
                  Credits
                </span>
              ) : (
                'none'
              )
            }
            error={
              transition?.price === undefined &&
              (!transition?.prices || transition?.prices?.length === 0)
            }
          />
          {transition?.prices != null && transition?.prices?.length > 0 && (
            <div className={'TokenTransitionCard__PriceList'}>
              <PriceList prices={transition?.prices} rate={rate} />
            </div>
          )}
        </>
      )}

      {fields.includes('PublicNote') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--PublicNote'}
          title={'Public Note'}
          value={transition?.publicNote}
          error={!transition?.publicNote}
        />
      )}

      {transition?.data != null && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Data'}
          title={'Data'}
          value={
            <pre className={'TokenTransitionCard__Data'}>
              {JSON.stringify(transition?.data, null, 2)}
            </pre>
          }
        />
      )}
    </div>
  )
}

export default TokenTransitionCard
