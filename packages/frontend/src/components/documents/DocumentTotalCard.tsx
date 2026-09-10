import type { ComponentType, ReactNode } from 'react'
import type { Document, Rate } from '../../types'
import type { LoadableState } from '../../types/common'
import ImageGenerator from '../imageGenerator'
import {
  Alias as AliasJs,
  CreditsBlock as CreditsBlockJs,
  DateBlock as DateBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs,
  NotActive as NotActiveJs,
  PrefundedBalance as PrefundedBalanceJs
} from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { ValueCard } from '../cards'
import { Badge } from '@chakra-ui/react'
import { findActiveAlias } from '../../util'
import './DocumentTotalCard.css'

// Untyped JS modules — cast until migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
}>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | string | null
  rate?: Rate | null
}>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
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
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>
const PrefundedBalance = PrefundedBalanceJs as ComponentType<{
  prefundedBalance?: unknown
  rate?: Rate | null
}>

interface DocumentTotalCardProps {
  document: LoadableState<Document & { name?: string }>
  rate?: Rate | null
  className?: string
}

function DocumentTotalCard({ document, rate, className }: DocumentTotalCardProps) {
  const activeAlias = findActiveAlias(document.data?.owner?.aliases)

  return (
    <div
      className={`InfoBlock InfoBlock--Gradient DocumentTotalCard ${document?.loading ? 'DocumentTotalCard--Loading' : ''} ${className || ''}`}
    >
      {document?.data?.name && (
        <div className={'DocumentTotalCard__Title'}>{document?.data.name}</div>
      )}

      <div className={'DocumentTotalCard__Header'}>
        <div className={'DocumentTotalCard__HeaderLines'}>
          <InfoLine
            className={'DocumentTotalCard__InfoLine DocumentTotalCard__Identifier'}
            title={'Identifier'}
            loading={document.loading}
            error={document.error || !document.data?.identifier}
            value={
              <Identifier copyButton={true} styles={['highlight-both']} ellipsis={false}>
                {document.data?.identifier}
              </Identifier>
            }
          />
        </div>
        <div className={'DocumentTotalCard__Avatar'}>
          {!document?.error ? (
            <ImageGenerator
              username={document.data?.identifier}
              lightness={50}
              saturation={50}
              width={88}
              height={88}
            />
          ) : (
            <NotActive />
          )}
        </div>
      </div>

      <div className={'DocumentTotalCard__CommonInfo'}>
        <InfoLine
          className={'DocumentTotalCard__InfoLine DocumentTotalCard__DataContract'}
          title={'Data Contract'}
          loading={document.loading}
          error={document.error}
          value={
            <ValueCard link={`/dataContract/${document.data?.dataContractIdentifier}`}>
              <Identifier
                avatar={true}
                className={''}
                copyButton={true}
                styles={['highlight-both']}
                ellipsis={false}
              >
                {document.data?.dataContractIdentifier}
              </Identifier>
            </ValueCard>
          }
        />

        <InfoLine
          className={'DocumentTotalCard__InfoLine DocumentTotalCard__Owner'}
          title={'Owner'}
          loading={document.loading}
          error={document.error}
          value={
            <ValueCard link={`/identity/${document.data?.owner?.identifier}`}>
              {activeAlias ? (
                <Alias avatarSource={document.data?.owner?.identifier || null}>
                  {activeAlias?.alias}
                </Alias>
              ) : (
                <Identifier
                  avatar={true}
                  className={''}
                  copyButton={true}
                  styles={['highlight-both']}
                  ellipsis={false}
                >
                  {document.data?.owner?.identifier}
                </Identifier>
              )}
            </ValueCard>
          }
        />

        <HorisontalSeparator className={'DocumentTotalCard__Separator'} />

        <InfoLine
          className={
            'DocumentTotalCard__InfoLine DocumentTotalCard__InfoLine--Entropy DocumentTotalCard__Entropy'
          }
          title={'Entropy'}
          loading={document.loading}
          error={document.error || !document.data?.entropy}
          value={
            <Identifier copyButton={true} styles={['highlight-both']} ellipsis={false}>
              {document.data?.entropy}
            </Identifier>
          }
        />

        <InfoLine
          className={'DocumentTotalCard__InfoLine'}
          title={'Document Type Name'}
          value={document.data?.documentTypeName || <NotActive>-</NotActive>}
          loading={document.loading}
          error={document.error || document.data?.documentTypeName === undefined}
        />

        <InfoLine
          className={'DocumentTotalCard__InfoLine'}
          title={'System'}
          value={<Badge colorScheme={'gray'}>{document.data?.system ? 'Yes' : 'No'}</Badge>}
          loading={document.loading}
          error={
            document.error || (typeof document.data?.system !== 'boolean' && !document.data?.system)
          }
        />

        <InfoLine
          title={'Total Gas Used'}
          value={<CreditsBlock credits={document.data?.totalGasUsed} rate={rate} />}
          loading={document.loading}
          error={document.error}
        />

        <InfoLine
          className={'DocumentTotalCard__InfoLine DocumentTotalCard__InfoLine--Revision'}
          title={'Revision'}
          value={document.data?.revision}
          loading={document.loading}
          error={document.error || document.data?.revision === undefined}
        />

        <InfoLine
          className={'DocumentTotalCard__InfoLine'}
          title={'Deleted'}
          value={
            <Badge colorScheme={document.data?.deleted ? 'red' : 'green'}>
              {document.data?.deleted ? 'True' : 'False'}
            </Badge>
          }
          loading={document.loading}
          error={document.error || document.data?.deleted === undefined}
        />

        {document.data?.prefundedVotingBalance && (
          <InfoLine
            className={'DocumentTotalCard__InfoLine'}
            title={'Prefunded Voting Balance'}
            value={
              <PrefundedBalance
                prefundedBalance={document.data?.prefundedVotingBalance}
                rate={rate}
              />
            }
            loading={document.loading}
            error={document.error}
          />
        )}

        <InfoLine
          className={'DocumentTotalCard__InfoLine DocumentTotalCard__InfoLine--Timestamp'}
          title={'Timestamp'}
          value={<DateBlock timestamp={document.data?.timestamp} />}
          loading={document.loading}
          error={document.error || !document.data?.timestamp}
        />
      </div>
    </div>
  )
}

export default DocumentTotalCard
