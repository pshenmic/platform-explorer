import { Button } from '@chakra-ui/react'
import { VoteControls } from './VoteControls'
import { VoteControlState } from './useVoteValidation'
import { VOTING_CAPABLE_TYPES } from './constants'

import './VoteManager.scss'

const getDisabledTooltip = (voteValidateState, walletInfo) => {
  if (voteValidateState === VoteControlState.USER_HAS_NO_EXTENSION) {
    return 'Install Dash Platform Extension to vote'
  }

  const hasVotingCapableIdentity = (walletInfo?.identities ?? []).some(
    ({ type }) => VOTING_CAPABLE_TYPES.includes(type)
  )

  return hasVotingCapableIdentity
    ? 'Please switch to a voting masternode identity'
    : 'Please choose a masternode identity from the extension'
}

export const VoteManeger = ({
  voteValidateState,
  connectWallet,
  isConnecting,
  walletInfo,
  identifier,
  ...other
}) => {
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
        onClick={() => connectWallet()}
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
      disabledTooltip={getDisabledTooltip(voteValidateState, walletInfo)}
      {...other}
    />
  )
}
