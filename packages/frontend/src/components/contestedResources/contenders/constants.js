export const VoteEnum = {
  TO_REJECT: 'lock',
  TO_ABSTAIN: 'abstain',
  TO_APPROVE: 'approve'
}

export const API_VOTE_ENUM = [VoteEnum.TO_APPROVE, VoteEnum.TO_ABSTAIN, VoteEnum.TO_REJECT]

// 'masternode' is included for forward-compatibility: protocol (rs-dpp) allows
// OWNER-purpose keys to vote, but dash-platform-extension 1.2.3 rejects them.
// See https://github.com/pshenmic/dash-platform-extension/issues/116
export const VOTING_CAPABLE_TYPES = ['voting', 'masternode']
