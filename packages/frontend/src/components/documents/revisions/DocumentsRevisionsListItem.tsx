import type { ComponentType, ReactNode } from 'react'
import type { Document, Rate } from '../../../types'

import {
  Alias as AliasJs,
  BigNumber as BigNumberJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../../data'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import { RateTooltip } from '../../ui/Tooltips'
import Link from 'next/link'
import { findActiveAlias } from '../../../util'
// Direct path — avoid transactions/index barrel (cycles via TransitionCard → documents)
import BatchTypeBadge from '../../transactions/BatchTypeBadge'
import './DocumentsRevisionsListItem.css'

// Loose casts for data/* props used here
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
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
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: Date | string | null
  showTimestampTooltip?: boolean
}>

interface DocumentsRevisionsListItemProps {
  revision?: any
  rate?: Rate | null
}

function DocumentsRevisionsListItem({ revision, rate }: DocumentsRevisionsListItemProps) {
  const activeAlias = findActiveAlias(revision.owner?.aliases)
  const router = useRouter()

  return (
    <Link href={`/transaction/${revision?.txHash}`} className={'DocumentsRevisionsListItem'}>
      <div className={'DocumentsRevisionsListItem__Content'}>
        <div
          className={
            'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Timestamp'
          }
        >
          {revision?.timestamp ? <TimeDelta endDate={revision?.timestamp} /> : <NotActive />}
        </div>

        <div
          className={
            'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--TxHash'
          }
        >
          {revision?.txHash ? (
            <Identifier ellipsis={true} styles={['highlight-both']}>
              {revision?.txHash}
            </Identifier>
          ) : (
            <NotActive />
          )}
        </div>

        <div
          className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Owner'}
        >
          {revision?.owner?.identifier ? (
            <LinkContainer
              className={'DocumentsRevisionsListItem__ColumnContent'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/identity/${revision?.owner?.identifier}`)
              }}
            >
              {activeAlias ? (
                <Alias avatarSource={revision?.owner?.identifier || null}>
                  {activeAlias?.alias}
                </Alias>
              ) : (
                <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                  {revision?.owner?.identifier}
                </Identifier>
              )}
            </LinkContainer>
          ) : (
            <NotActive />
          )}
        </div>

        <div
          className={
            'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--GasUsed DocumentsRevisionsListItem__Column--Credits'
          }
        >
          {revision?.gasUsed ? (
            <RateTooltip credits={revision?.gasUsed} rate={rate}>
              <span>
                <BigNumber>{revision?.gasUsed}</BigNumber>
              </span>
            </RateTooltip>
          ) : (
            <NotActive>-</NotActive>
          )}
        </div>

        <div
          className={
            'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--TransitionType'
          }
        >
          {revision?.transitionType != null ? (
            <BatchTypeBadge batchType={revision.transitionType} />
          ) : (
            <NotActive>-</NotActive>
          )}
        </div>

        <div
          className={
            'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Revision DocumentsRevisionsListItem__Column--Number'
          }
        >
          {typeof revision?.revision === 'number' ? revision.revision : <NotActive>-</NotActive>}
        </div>
      </div>
    </Link>
  )
}

export default DocumentsRevisionsListItem
