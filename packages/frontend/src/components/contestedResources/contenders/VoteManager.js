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
    ? 'Switch to a masternode identity'
    : 'Requires a masternode identity'
}

export const VoteManeger = ({
  voteValidateState,
  connectWallet,
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
      <VoteControls
        contender={identifier}
        walletInfo={walletInfo}
        disabledTooltip='Connect wallet to vote'
        onConnectRequest={() => connectWallet()}
        {...other}
      />
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
