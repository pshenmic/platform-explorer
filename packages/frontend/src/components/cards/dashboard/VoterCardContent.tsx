import type { ComponentType, ReactNode } from 'react'
import { Flex } from '@chakra-ui/react'
import type { BestVoter } from '../../../types'
import IdentifierJs from '../../data/Identifier'
import VoteBadgesJs from '../../contestedResources/VoteBadges'
import './TotalValidatorsCardContent.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  copyButton?: boolean
  styles?: string[]
  ellipsis?: boolean
}>

const VoteBadges = VoteBadgesJs as ComponentType<{
  className?: string
  totalCountAbstain?: number
  totalCountLock?: number
  totalCountTowardsIdentity?: number
}>

interface VoterCardContentProps {
  voter?: Partial<BestVoter> | null
  nullMessage?: ReactNode
}

export function VoterCardContent({ voter = {}, nullMessage = 'None' }: VoterCardContentProps) {
  const { identifier, totalCountAbstain, totalCountLock, totalCountTowardsIdentity } = voter || {}

  return (
    <Flex gap={'0.25rem'} flexDirection={'column'}>
      {identifier ? (
        <>
          <Identifier copyButton={true} avatar={true} styles={['highlight-both']}>
            {identifier}
          </Identifier>

          {identifier && (
            <VoteBadges
              totalCountAbstain={totalCountAbstain}
              totalCountLock={totalCountLock}
              totalCountTowardsIdentity={totalCountTowardsIdentity}
            />
          )}
        </>
      ) : (
        nullMessage
      )}
    </Flex>
  )
}
