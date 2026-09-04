import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { Identifier as IdentifierJs, BigNumber as BigNumberJs } from '../../data'
import ValueContainer from '../../ui/containers/ValueContainer'

import './GroupsListItem.css'

// Untyped JS components — loose wrappers until data/* is migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>

export interface GroupMember {
  identifier: string
  power: number | string
}

interface GroupsListItemProps {
  member: GroupMember
}

function GroupsListItem({ member }: GroupsListItemProps) {
  return (
    <Link href={`/identity/${member.identifier}`} className={'GroupsListItem'}>
      <div className={'GroupsListItem__Content'}>
        <div className={'GroupsListItem__Column GroupsListItem__Column--Identifier'}>
          <Identifier
            avatar={true}
            ellipsis={true}
            styles={['highlight-both']}
            className={'GroupsListItem__Identifier'}
          >
            {member.identifier}
          </Identifier>
        </div>

        <div className={'GroupsListItem__Column GroupsListItem__Column--Power'}>
          <ValueContainer colorScheme={'darkGray'} size={'xs'}>
            <BigNumber>{member.power}</BigNumber>
          </ValueContainer>
        </div>
      </div>
    </Link>
  )
}

export default GroupsListItem
