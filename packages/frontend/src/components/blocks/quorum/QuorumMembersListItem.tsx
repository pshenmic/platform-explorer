import type { ComponentType, ReactNode } from 'react'
import { Badge, Grid, GridItem } from '@chakra-ui/react'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Identifier as IdentifierJs,
  IpAddress as IpAddressJs
} from '../../data'
import Link from 'next/link'
import './QuorumMembersListItem.scss'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  styles?: string[]
  ellipsis?: boolean
  avatar?: boolean
  copyButton?: boolean
}>
const IpAddress = IpAddressJs as ComponentType<{
  children?: ReactNode
  variant?: string
  clickable?: boolean
}>

export interface QuorumMember {
  proTxHash?: string | null
  service?: string | null
  pubKeyOperator?: string | null
  valid?: boolean | null
}

interface QuorumMembersListItemProps {
  member?: QuorumMember | null
}

function QuorumMembersListItem ({ member }: QuorumMembersListItemProps) {
  return (
    <Link href={`/validator/${member?.proTxHash}`} className={'QuorumListItem'}>
      <Grid className={'QuorumListItem__Content'}>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--ProtxHash'}>
          <Identifier
            styles={['highlight-both']}
            ellipsis={true}
            avatar={true}
          >
            {member?.proTxHash}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Service'}>
          <IpAddress variant={'dim'} clickable={false}>{member?.service}</IpAddress>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--OperatorPubKey'}>
          <Identifier
            styles={['highlight-both']}
            ellipsis={false}
            copyButton={true}
          >
            {member?.pubKeyOperator}
          </Identifier>
        </GridItem>
        <GridItem className={'QuorumListItem__Column QuorumListItem__Column--Valid'}>
          {typeof member?.valid === 'boolean' &&
            <Badge colorScheme={member?.valid ? 'green' : 'red'}>
              {member?.valid ? 'Valid' : 'No'}
            </Badge>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default QuorumMembersListItem
