export const VoteEnum = {
  TO_REJECT: 'lock',
  TO_ABSTAIN: 'abstain',
  TO_APPROVE: 'approve'
}

export const API_VOTE_ENUM = [VoteEnum.TO_APPROVE, VoteEnum.TO_ABSTAIN, VoteEnum.TO_REJECT]

// Masternode vote state transitions require strictly Purpose::VOTING keys at the
// protocol level, per rs-dpp: masternode_vote_transition/v0 returns
// `purpose_requirement() -> vec![Purpose::VOTING]`.
// https://github.com/dashpay/platform/blob/master/packages/rs-dpp/src/state_transition/state_transitions/identity/masternode_vote_transition/v0/identity_signed.rs
// Only identities of extension type 'voting' carry such keys.
export const VOTING_CAPABLE_TYPES = ['voting']
