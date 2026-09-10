import type { ComponentType, ReactNode } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Alias as AliasJs,
  BigNumber as BigNumberJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  TimeDelta as TimeDeltaJs
} from '../../data'
import { LinkContainer } from '../../ui/containers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../../util'
import type { Alias } from '../../../types'
import './HoldersListItem.css'

const AliasEl = AliasJs as ComponentType<{
  children?: ReactNode
  avatarSource?: string | null
  alias?: string | null
  ellipsis?: boolean
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode, className?: string }>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  ellipsis?: boolean
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: string | Date | null }>

export interface TokenHolder {
  identifier?: string | null
  aliases?: Alias[] | null
  tokensAmount?: string | number | null
  dashAmount?: string | number | null
  lastActivity?: string | Date | null
}

interface HoldersListItemProps {
  holder: TokenHolder
}

function HoldersListItem ({ holder }: HoldersListItemProps) {
  const activeAlias = findActiveAlias(holder?.aliases || [])
  const router = useRouter()

  return (
    <Link href={`/identity/${holder?.identifier}`} className={'HoldersListItem'}>
      <Grid className={'HoldersListItem__Content'}>
        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--Holder'}>
          {holder?.identifier
            ? <LinkContainer
                className={'HoldersListItem__ColumnContent'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${holder?.identifier}`)
                }}
              >
                {activeAlias
                  ? <AliasEl avatarSource={holder?.identifier || null}>{activeAlias?.alias}</AliasEl>
                  : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{holder?.identifier}</Identifier>
                }
              </LinkContainer>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--TokensAmount HoldersListItem__Column--Number'}>
          <div className={'HoldersListItem__ColumnContent'}>
            <BigNumber>{holder.tokensAmount}</BigNumber>
          </div>
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--DashAmount HoldersListItem__Column--Number'}>
          <div className={'HoldersListItem__ColumnContent'}>
            <BigNumber>{holder.dashAmount}</BigNumber>
          </div>
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--LastActivity HoldersListItem__Column--Timestamp'}>
          <TimeDelta endDate={holder?.lastActivity}/>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default HoldersListItem
