import { IconButton, Tooltip, useToast } from '@chakra-ui/react'
import {
  PrimalPostitiveIcon,
  PrimalNegativeIcon,
  CloseIcon
} from '../../ui/icons'
import { VoteEnum } from './constants'

import './VoteControls.scss'
import { useState, useEffect } from 'react'

const VOTING_DATA_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VOTING_DATA_CONTRACT_ID ??
  'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
const DOCUMENT_TYPE = 'domain'
const INDEX_NAME = 'parentNameAndLabel'

export const VoteControls = ({
  currentIdentity,
  contender,
  resourceValue,
  walletInfo,
  prevVote,
  refresh,
  isPollingAfterVote,
  isDisabled = false,
  disabledTooltip
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeChoice, setActiveChoice] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (!isPollingAfterVote) {
      setIsLoading(false)
      setActiveChoice(null)
    }
  }, [isPollingAfterVote])

  const castVote = async ({ choice }) => {
    if (!window.dashPlatformExtension) return

    setActiveChoice(choice)
    setIsLoading(true)
    try {
      const sdk = window.dashPlatformSDK
      const voterIdentity =
        await sdk.identities.getIdentityByIdentifier(currentIdentity)
      const identityNonce = await sdk.identities.getIdentityNonce(
        voterIdentity.id
      )
      const { proTxHash } = walletInfo

      const vote = sdk.voting.createVote(
        VOTING_DATA_CONTRACT_ID,
        DOCUMENT_TYPE,
        INDEX_NAME,
        resourceValue,
        choice
      )
      const stateTransition = sdk.voting.createStateTransition(
        vote,
        proTxHash,
        voterIdentity.id,
        identityNonce + BigInt(1)
      )

      await window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)

      refresh()
    } catch (e) {
      console.error(e)
      toast({
        title: 'Failed to submit vote',
        description: e?.message ?? 'Unknown error',
        status: 'error',
        duration: 7000,
        isClosable: true
      })
      setIsLoading(false)
    }
  }

  const buttonDisabled = isDisabled || isLoading

  return (
    <Tooltip isDisabled={!isDisabled || !disabledTooltip} label={disabledTooltip}>
      <div className='VoteControls'>
        <IconButton
          color='#58F4BC'
          bg='#58F4BC26'
          _hover={{ bg: '#58F4BC4D' }}
          _active={{ bg: '#58F4BC', color: '#21272C' }}
          isDisabled={buttonDisabled || prevVote === VoteEnum.TO_APPROVE}
          isLoading={isLoading && activeChoice === contender}
          size='30px'
          aria-label='vote'
          p={0}
          icon={<PrimalPostitiveIcon width='18px' height='10px' />}
          onClick={() => castVote({ choice: contender })}
        />
        <IconButton
          color='#F49A58'
          bg='#F49A5826'
          _hover={{ bg: '#F49A584D' }}
          _active={{ bg: '#F49A58', color: '#21272C' }}
          isDisabled={buttonDisabled || prevVote === VoteEnum.TO_ABSTAIN}
          isLoading={isLoading && activeChoice === VoteEnum.TO_ABSTAIN}
          size='30px'
          aria-label='vote'
          p={0}
          icon={<PrimalNegativeIcon width='11px' height='10px' />}
          onClick={() => castVote({ choice: VoteEnum.TO_ABSTAIN })}
        />
        <IconButton
          color='#F45858'
          bg='#F4585826'
          _hover={{ bg: '#F458584D' }}
          _active={{ bg: '#F45858', color: '#21272C' }}
          isDisabled={buttonDisabled || prevVote === VoteEnum.TO_REJECT}
          isLoading={isLoading && activeChoice === VoteEnum.TO_REJECT}
          size='30px'
          aria-label='vote'
          p={0}
          icon={<CloseIcon width='8px' height='8px' />}
          onClick={() => castVote({ choice: VoteEnum.TO_REJECT })}
        />
      </div>
    </Tooltip>
  )
}
