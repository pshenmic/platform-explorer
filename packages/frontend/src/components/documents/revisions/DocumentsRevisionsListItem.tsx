import type { ComponentType, ReactNode } from 'react'
import type { Document, Rate } from '../../../types'
import { Grid, GridItem } from '@chakra-ui/react'
import { Alias as AliasJs, BigNumber as BigNumberJs, Identifier as IdentifierJs, NotActive as NotActiveJs, TimeDelta as TimeDeltaJs } from '../../data'
import { LinkContainer } from '../../ui/containers'
import { useRouter } from 'next/navigation'
import { RateTooltip } from '../../ui/Tooltips'
import Link from 'next/link'
import { findActiveAlias } from '../../../util'
import { BatchTypeBadge as BatchTypeBadgeJs } from '../../transactions'
import './DocumentsRevisionsListItem.scss'

// Untyped JS modules — cast until migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode, className?: string }>
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
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: Date | string | null, showTimestampTooltip?: boolean }>
const BatchTypeBadge = BatchTypeBadgeJs as ComponentType<{ batchType?: string | null, className?: string }>

interface DocumentsRevisionsListItemProps {
  revision?: any
  rate?: Rate | null
}

function DocumentsRevisionsListItem ({  revision, rate  }: DocumentsRevisionsListItemProps) {
  const activeAlias = findActiveAlias(revision.owner?.aliases)
  const router = useRouter()

  return (
    <Link href={`/transaction/${revision?.txHash}`} className={'DocumentsRevisionsListItem'}>
      <Grid className={'DocumentsRevisionsListItem__Content'}>
        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Timestamp'}>
          {revision?.timestamp
            ? <TimeDelta endDate={revision?.timestamp}/>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--TxHash'}>
          {revision?.txHash
            ? <Identifier ellipsis={true} styles={['highlight-both']}>{revision?.txHash}</Identifier>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Owner'}>
          {revision?.owner?.identifier
            ? <LinkContainer
                className={'DocumentsRevisionsListItem__ColumnContent'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${revision?.owner?.identifier}`)
                }}
              >
                {activeAlias
                  ? <Alias avatarSource={revision?.owner?.identifier || null}>{activeAlias?.alias}</Alias>
                  : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{revision?.owner?.identifier}</Identifier>
                }
              </LinkContainer>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--GasUsed DocumentsRevisionsListItem__Column--Credits'}>
          {revision?.gasUsed
            ? <RateTooltip credits={revision?.gasUsed} rate={rate}>
              <span><BigNumber>{revision?.gasUsed}</BigNumber></span>
            </RateTooltip>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--TransitionType'}>
          {revision?.transitionType != null
            ? <BatchTypeBadge batchType={revision.transitionType}/>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'DocumentsRevisionsListItem__Column DocumentsRevisionsListItem__Column--Revision DocumentsRevisionsListItem__Column--Number'}>
          {typeof revision?.revision === 'number'
            ? revision.revision
            : <NotActive>-</NotActive>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DocumentsRevisionsListItem
