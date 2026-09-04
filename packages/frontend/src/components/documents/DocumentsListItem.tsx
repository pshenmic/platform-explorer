import type { ComponentType, ReactNode } from 'react'
import type { Document } from '../../types'
import type { LoadableState } from '../../types/common'
import { Badge } from '@chakra-ui/react'
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../data'
import { LinkContainer } from '../ui/containers'
import BatchTypeBadgeJs from '../transactions/BatchTypeBadge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../util'
import './DocumentsListItem.css'

// Untyped JS modules — cast until migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
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
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: Date | string | null
  showTimestampTooltip?: boolean
}>
const BatchTypeBadge = BatchTypeBadgeJs as ComponentType<{
  batchType?: string | null
  className?: string
}>

interface DocumentsListItemProps {
  document: Document & { gasUsed?: number }
  showDataContract?: boolean
  showAction?: boolean
  showGas?: boolean
}

function DocumentsListItem({
  document,
  showDataContract = false,
  showAction = true,
  showGas = true
}: DocumentsListItemProps) {
  const activeAlias = findActiveAlias(document?.owner?.aliases)
  const router = useRouter()

  return (
    <Link href={`/document/${document?.identifier}`} className={'DocumentsListItem'}>
      <div className={'DocumentsListItem__Column DocumentsListItem__Column--Timestamp'}>
        <TimeDelta endDate={document?.timestamp} />
      </div>

      {showAction && (
        <div className={'DocumentsListItem__Column DocumentsListItem__Column--TransitionType'}>
          {document?.transitionType ? (
            <BatchTypeBadge batchType={document.transitionType} />
          ) : (
            <NotActive />
          )}
        </div>
      )}

      <div
        className={'DocumentsListItem__Column DocumentsListItem__Column--DocumentType'}
        title={document?.documentTypeName || undefined}
      >
        {document?.documentTypeName ?? <NotActive />}
      </div>

      <div className={'DocumentsListItem__Column DocumentsListItem__Column--Revision'}>
        {document?.revision ?? <NotActive />}
      </div>

      <div className={'DocumentsListItem__Column DocumentsListItem__Column--Identifier'}>
        {document?.identifier ? (
          <Identifier ellipsis={true} styles={['highlight-both']}>
            {document?.identifier}
          </Identifier>
        ) : (
          <NotActive />
        )}
      </div>

      {showDataContract ? (
        <div className={'DocumentsListItem__Column DocumentsListItem__Column--DataContract'}>
          {document?.dataContractIdentifier ? (
            <LinkContainer
              className={'DocumentsListItem__ColumnContent'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/dataContract/${document?.dataContractIdentifier}`)
              }}
            >
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {document?.dataContractIdentifier}
              </Identifier>
            </LinkContainer>
          ) : (
            <NotActive />
          )}
        </div>
      ) : (
        <div className={'DocumentsListItem__Column DocumentsListItem__Column--Owner'}>
          {document?.owner ? (
            <LinkContainer
              className={'DocumentsListItem__ColumnContent'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/identity/${document?.owner?.identifier}`)
              }}
            >
              {activeAlias ? (
                <Alias avatarSource={document?.owner?.identifier || null}>
                  {activeAlias?.alias}
                </Alias>
              ) : (
                <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                  {document?.owner?.identifier}
                </Identifier>
              )}
            </LinkContainer>
          ) : (
            <NotActive />
          )}
        </div>
      )}

      {showGas && (
        <div className={'DocumentsListItem__Column DocumentsListItem__Column--Gas'}>
          {Number.isFinite(document?.gasUsed) ? document.gasUsed.toLocaleString() : <NotActive />}
        </div>
      )}

      <div className={'DocumentsListItem__Column DocumentsListItem__Column--Status'}>
        {document?.deleted ? (
          <Badge colorScheme={'red'}>Deleted</Badge>
        ) : (
          <Badge colorScheme={'green'}>Active</Badge>
        )}
      </div>
    </Link>
  )
}

export default DocumentsListItem
