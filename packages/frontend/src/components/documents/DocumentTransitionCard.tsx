import type { ComponentType, ReactNode } from 'react'
import type { Identity, Document, Rate } from '../../types'
import { ValueCard } from '../cards'
import {
  CreditsBlock as CreditsBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs,
  PrefundedBalance as PrefundedBalanceJs
} from '../data'
import BatchTypeBadgeJs from '../transactions/BatchTypeBadge'
import { ValueContainer } from '../ui/containers'
import './DocumentTransitionCard.css'

// Untyped JS modules — cast until migrated
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | string | null
  rate?: Rate | null
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean
}>
const PrefundedBalance = PrefundedBalanceJs as ComponentType<{
  prefundedBalance?: unknown
  rate?: Rate | null
}>
const BatchTypeBadge = BatchTypeBadgeJs as ComponentType<{
  batchType?: string | null
  className?: string
}>

const fieldsOfTypes: Record<string, string[]> = {
  DOCUMENT_CREATE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'Data',
    'PrefundedVotingBalance'
  ],
  DOCUMENT_REPLACE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_DELETE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'IdentityContractNonce',
    'Data'
  ],
  DOCUMENT_TRANSFER: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'SenderIdentifier',
    'RecipientIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_PURCHASE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'BuyerIdentifier',
    'SellerIdentifier',
    'DocumentType',
    'Price',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_UPDATE_PRICE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'SenderIdentifier',
    'RecipientIdentifier',
    'DocumentType',
    'Price',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ]
}

interface DocumentTransitionCardProps {
  transition: Record<string, any>
  owner?: any
  rate?: Rate | null
  className?: string
}

const DocumentTransitionCard = ({
  transition,
  owner,
  rate,
  className
}: DocumentTransitionCardProps) => {
  const fields = fieldsOfTypes?.[String(transition?.action ?? '')] || []

  return (
    <div className={`InfoBlock InfoBlock--Gradient DocumentTransitionCard ${className || ''}`}>
      <InfoLine
        className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Action'}
        title={'Action'}
        value={
          <BatchTypeBadge
            className="DocumentTransitionCard__InfoLine__Badge"
            batchType={transition?.action}
          />
        }
        error={transition?.action === undefined}
      />

      {fields?.indexOf('DataContractIdentifier') !== -1 && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'
          }
          title={'Data Contract Identifier'}
          value={
            <ValueCard link={`/dataContract/${transition.dataContractId}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition.dataContractId}
              </Identifier>
            </ValueCard>
          }
          error={!transition.dataContractId}
        />
      )}

      {fields?.indexOf('DocumentIdentifier') !== -1 && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'
          }
          title={'Document Identifier'}
          value={
            <ValueCard link={`/document/${transition.id}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition.id}
              </Identifier>
            </ValueCard>
          }
          error={!transition.id}
        />
      )}

      {fields?.indexOf('RecipientIdentifier') !== -1 && transition?.recipientId && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'
          }
          title={'Recipient Identifier'}
          value={
            <ValueCard link={`/identity/${transition?.recipientId}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {transition?.recipientId}
              </Identifier>
            </ValueCard>
          }
        />
      )}

      {fields?.indexOf('SellerIdentifier') !== -1 && owner && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'
          }
          title={'Buyer Identifier'}
          value={
            <ValueCard link={`/identity/${owner}`}>
              <Identifier
                avatar={true}
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {owner}
              </Identifier>
            </ValueCard>
          }
        />
      )}

      {fields?.indexOf('Price') !== -1 && (
        <InfoLine
          className={'DocumentTransitionCard__InfoLine'}
          title={'Price'}
          value={<CreditsBlock credits={transition?.price} rate={rate} />}
          error={transition?.price === undefined}
        />
      )}

      {fields?.indexOf('DocumentType') !== -1 && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--DocumentType'
          }
          title={'Document Type'}
          value={<ValueContainer>{transition?.type}</ValueContainer>}
          error={!transition?.type}
        />
      )}

      {fields?.indexOf('Revision') !== -1 && (
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Revision'}
          title={'Revision'}
          value={transition?.revision}
          error={transition?.revision === undefined}
        />
      )}

      {fields?.indexOf('IdentityContractNonce') !== -1 && (
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Nonce'}
          title={'Identity Contract Nonce'}
          value={transition?.identityContractNonce}
          error={transition?.identityContractNonce === undefined}
        />
      )}

      {fields?.indexOf('Data') !== -1 && transition?.data && (
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Data'}
          title={'Data'}
          value={
            <pre className={'DocumentTransitionCard__Code'}>
              {JSON.stringify(transition?.data, null, 2)}
            </pre>
          }
          error={transition?.data === undefined}
        />
      )}

      {transition?.prefundedVotingBalance && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--PrefundedBalance'
          }
          title={'Prefunded Voting Balance'}
          value={
            <PrefundedBalance prefundedBalance={transition?.prefundedVotingBalance} rate={rate} />
          }
        />
      )}

      {transition?.tokenPaymentInfo && (
        <InfoLine
          className={
            'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--PaymentInfo'
          }
          title={'Token Payment Info'}
          value={
            <>
              <InfoLine
                title={'Gas Fees Paid By'}
                value={transition.tokenPaymentInfo.gasFeesPaidBy}
              />
              <InfoLine
                title={'maximumTokenCost'}
                value={transition.tokenPaymentInfo.maximumTokenCost ?? '-'}
              />
              <InfoLine
                title={'minimumTokenCost'}
                value={transition.tokenPaymentInfo.minimumTokenCost}
              />
              <InfoLine
                title={'paymentTokenContractId'}
                value={transition.tokenPaymentInfo.paymentTokenContractId}
              />
              <InfoLine
                title={'tokenContractPosition'}
                value={transition.tokenPaymentInfo.tokenContractPosition}
              />
            </>
          }
        />
      )}
    </div>
  )
}

export default DocumentTransitionCard
