import { Flex } from '@chakra-ui/react'
import { Identifier } from '../../data'
import VoteBadges from '../../contestedResources/VoteBadges'
import './TotalValidatorsCardContent.scss'

export function VoterCardContent ({ voter = {}, nullMessage = 'None' }) {
  const { identifier, abstain, lock, yes } = voter || {}

  return (
    <Flex gap={'0.25rem'} flexDirection={'column'}>
      {identifier
        ? <>
            <Identifier copyButton={true} avatar={true} styles={['highlight-both']}>
              {identifier}
            </Identifier>

            {identifier &&
              <VoteBadges
                totalCountAbstain={abstain}
                totalCountLock={lock}
                totalCountTowardsIdentity={yes}
              />
            }
          </>
        : nullMessage
      }
    </Flex>
  )
}
