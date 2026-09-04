import type { ComponentType, ReactNode } from 'react'
import { Badge } from '../../ui/Badge'
// Untyped JS components — loose wrappers until data/* is migrated
import { Identifier as IdentifierJs, IpAddress as IpAddressJs } from '../../data'
import Link from 'next/link'
import './QuorumMembersListItem.css'

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

function QuorumMembersListItem({ member }: QuorumMembersListItemProps) {
  return (
    <Link href={`/validator/${member?.proTxHash}`} className={'QuorumListItem'}>
      <div className={'QuorumListItem__Content'}>
        <div className={'QuorumListItem__Column QuorumListItem__Column--ProtxHash'}>
          <Identifier styles={['highlight-both']} ellipsis={true} avatar={true}>
            {member?.proTxHash}
          </Identifier>
        </div>
        <div className={'QuorumListItem__Column QuorumListItem__Column--Service'}>
          <IpAddress variant={'dim'} clickable={false}>
            {member?.service}
          </IpAddress>
        </div>
        <div className={'QuorumListItem__Column QuorumListItem__Column--OperatorPubKey'}>
          <Identifier styles={['highlight-both']} ellipsis={false} copyButton={true}>
            {member?.pubKeyOperator}
          </Identifier>
        </div>
        <div className={'QuorumListItem__Column QuorumListItem__Column--Valid'}>
          {typeof member?.valid === 'boolean' && (
            <Badge colorScheme={member?.valid ? 'green' : 'red'}>
              {member?.valid ? 'Valid' : 'No'}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

export default QuorumMembersListItem
