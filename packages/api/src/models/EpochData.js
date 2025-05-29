module.exports = class EpochData {
  epoch
  tps
  totalCollectedFees
  bestValidator
  topVotedResource
  bestVoter
  totalVotesCount
  totalVotesGasUsed

  constructor (epoch, tps, totalCollectedFees, bestValidator, topVotedResource, bestVoter, totalVotesCount, totalVotesGasUsed) {
    this.epoch = epoch ?? null
    this.tps = tps ?? null
    this.totalCollectedFees = totalCollectedFees ?? null
    this.bestValidator = bestValidator ?? null
    this.topVotedResource = topVotedResource ?? null
    this.bestVoter = bestVoter ?? null
    this.totalVotesCount = totalVotesCount ?? null
    this.totalVotesGasUsed = totalVotesGasUsed ?? null
  }

  /* eslint-disable camelcase */
  static fromObject ({
    epoch,
    tps,
    total_collected_fees,
    best_validator,
    voter_identity_id,
    voter_yes,
    voter_abstain,
    voter_lock,
    top_voted_resource,
    resource_votes_yes,
    resource_votes_abstain,
    resource_votes_lock,
    total_votes,
    total_votes_gas_used
  }) {
    return new EpochData(
      epoch,
      Number(tps ?? 0),
      Number(total_collected_fees ?? 0),
      best_validator,
      {
        resourceValue: top_voted_resource ?? null,
        totalCountTowardsIdentity: Number(resource_votes_yes ?? 0),
        totalCountAbstain: Number(resource_votes_abstain ?? 0),
        totalCountLock: Number(resource_votes_lock ?? 0)
      },
      {
        identifier: voter_identity_id ?? null,
        totalCountTowardsIdentity: Number(voter_yes ?? 0),
        totalCountAbstain: Number(voter_abstain ?? 0),
        totalCountLock: Number(voter_lock ?? 0)
      },
      Number(total_votes ?? 0),
      Number(total_votes_gas_used ?? 0)
    )
  }
}
