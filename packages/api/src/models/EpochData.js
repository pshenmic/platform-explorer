module.exports = class EpochData {
  epoch
  tps
  totalCollectedFees
  bestValidator
  topVotedResource
  bestVoter
  totalVotesCount
  totalVotesGasUsed
  totalTxCount
  totalCreatedDocumentsCount
  totalDeletedDocumentsCount
  totalRegisteredNamesCount
  totalContestedDocumentsCount
  avgBlockTime
  pendingBlocksInEpoch
  pendingEpochReward

  constructor (epoch, tps, totalCollectedFees, bestValidator, topVotedResource, bestVoter, totalVotesCount, totalVotesGasUsed, totalTxCount, totalCreatedDocumentsCount, totalDeletedDocumentsCount, totalRegisteredNamesCount, totalContestedDocumentsCount, avgBlockTime, pendingBlocksInEpoch, pendingEpochReward) {
    this.epoch = epoch ?? null
    this.tps = tps ?? null
    this.totalCollectedFees = totalCollectedFees ?? null
    this.bestValidator = bestValidator ?? null
    this.topVotedResource = topVotedResource ?? null
    this.bestVoter = bestVoter ?? null
    this.totalVotesCount = totalVotesCount ?? null
    this.totalVotesGasUsed = totalVotesGasUsed ?? null
    this.totalTxCount = totalTxCount ?? null
    this.totalCreatedDocumentsCount = totalCreatedDocumentsCount ?? null
    this.totalDeletedDocumentsCount = totalDeletedDocumentsCount ?? null
    this.totalRegisteredNamesCount = totalRegisteredNamesCount ?? null
    this.totalContestedDocumentsCount = totalContestedDocumentsCount ?? null
    this.avgBlockTime = avgBlockTime ?? null
    this.pendingBlocksInEpoch = pendingBlocksInEpoch ?? null
    this.pendingEpochReward = pendingEpochReward ?? null
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
    total_votes_gas_used,
    total_tx_count,
    total_created_documents_count,
    total_deleted_documents_count,
    total_registered_names_count,
    total_contested_documents_count,
    avg_block_time,
    pending_blocks_in_epoch,
    pending_epoch_reward
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
      Number(total_votes_gas_used ?? 0),
      Number(total_tx_count ?? 0),
      Number(total_created_documents_count ?? 0),
      Number(total_deleted_documents_count ?? 0),
      Number(total_registered_names_count ?? 0),
      Number(total_contested_documents_count ?? 0),
      avg_block_time !== null && avg_block_time !== undefined ? Number(avg_block_time) : null,
      pending_blocks_in_epoch !== undefined ? Number(pending_blocks_in_epoch ?? 0) : null,
      pending_epoch_reward !== undefined ? Number(pending_epoch_reward ?? 0) : null
    )
  }
}
