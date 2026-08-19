import { Button } from '@chakra-ui/react'
import { VoteControls } from './VoteControls'
import { VoteControlState } from './useVoteValidation'
import type { VoteControlStateValue } from './useVoteValidation'
import { VOTING_CAPABLE_TYPES } from './constants'
import type { VoteEnumValue } from './constants'
import type { WalletInfo } from 'src/contexts'

import './VoteManager.css'

interface IdentityWithType {
  identifier: string
  type?: string
}

const getDisabledTooltip = (
  voteValidateState: VoteControlStateValue,
  walletInfo?: WalletInfo | null
) => {
  if (voteValidateState === VoteControlState.USER_HAS_NO_EXTENSION) {
    return 'Install Dash Platform Extension to vote'
  }

  const hasVotingCapableIdentity = ((walletInfo?.identities ?? []) as IdentityWithType[]).some(
    ({ type }) => type != null && (VOTING_CAPABLE_TYPES as readonly string[]).includes(type)
  )

  return hasVotingCapableIdentity
    ? 'Please switch to a voting masternode identity'
    : 'Please choose a masternode identity from the extension'
}

interface VoteManagerProps {
  voteValidateState?: VoteControlStateValue
  connectWallet?: () => void
  isConnecting?: boolean
  walletInfo?: WalletInfo | null
  identifier?: string
  currentIdentity?: string | null
  resourceValue?: string[] | unknown
  prevVote?: VoteEnumValue | null
  refresh?: () => void
  isPollingAfterVote?: boolean
}

export const VoteManeger = ({
  voteValidateState,
  connectWallet,
  isConnecting,
  walletInfo,
  identifier,
  ...other
}: VoteManagerProps) => {
  if (voteValidateState === VoteControlState.CAN_VOTE) {
    return (
      <VoteControls
        contender={identifier}
        walletInfo={walletInfo}
        {...other}
      />
    )
  }

  if (voteValidateState === VoteControlState.USER_HAS_NO_WALLET) {
    return (
      <Button
        onClick={() => connectWallet?.()}
        isLoading={isConnecting}
        variant='brand'
        size='sm'
        h='30px'
        w='94px'
      >
        Vote
      </Button>
    )
  }

  return (
    <VoteControls
      contender={identifier}
      walletInfo={walletInfo}
      isDisabled
      disabledTooltip={getDisabledTooltip(
        voteValidateState ?? VoteControlState.INIT_INVALID,
        walletInfo
      )}
      {...other}
    />
  )
}
