/* eslint-disable camelcase */
const BlockHeader = require('./BlockHeader')

module.exports = class Validator {
  proTxHash
  isActive
  proposedBlocksAmount
  lastProposedBlockHeader
  proTxInfo
  identifier
  identityBalance
  epochInfo
  totalReward
  epochReward
  withdrawlsCount
  lastWithdrawl

  constructor (
    proTxHash,
    isActive,
    proposedBlocksAmount,
    lastProposedBlockHeader,
    proTxInfo,
    totalReward,
    epochReward,
    withdrawlsCount,
    lastWithdrawl,
    identifier,
    identityBalance,
    epochInfo
  ) {
    this.proTxHash = proTxHash ?? null
    this.isActive = isActive ?? null
    this.proposedBlocksAmount = proposedBlocksAmount ?? null
    this.lastProposedBlockHeader = lastProposedBlockHeader ?? null
    this.proTxInfo = proTxInfo ?? null
    this.identifier = identifier ?? null
    this.identityBalance = identityBalance ?? null
    this.epochInfo = epochInfo ?? null
    this.totalReward = totalReward ?? null
    this.epochReward = epochReward ?? null
    this.withdrawlsCount = withdrawlsCount ?? null
    this.lastWithdrawl = lastWithdrawl ?? null
  }

  static fromRow ({
    pro_tx_hash,
    proposed_blocks_amount,
    latest_height,
    latest_timestamp,
    block_hash,
    l1_locked_height,
    app_version,
    block_version,
    is_active,
    total_collected_reward,
    total_collected_reward_by_epoch,
    withdrawls_count,
    last_withdrawl
  }) {
    return new Validator(
      pro_tx_hash,
      is_active,
      Number(proposed_blocks_amount),
      block_hash
        ? BlockHeader.fromRow({
          hash: block_hash,
          height: Number(latest_height),
          timestamp: latest_timestamp,
          block_version: Number(block_version),
          app_version: Number(app_version),
          l1_locked_height: Number(l1_locked_height),
          validator: pro_tx_hash
        })
        : null,
      null,
      Number(total_collected_reward),
      Number(total_collected_reward_by_epoch),
      Number(withdrawls_count),
      last_withdrawl
    )
  }

  static fromObject ({
    proTxHash,
    isActive,
    proposedBlocksAmount,
    lastProposedBlockHeader,
    proTxInfo,
    totalReward,
    epochReward,
    withdrawlsCount,
    lastWithdrawl,
    identifier,
    identityBalance,
    epochInfo
  }) {
    return new Validator(
      proTxHash,
      isActive,
      proposedBlocksAmount,
      lastProposedBlockHeader,
      proTxInfo,
      totalReward,
      epochReward,
      withdrawlsCount,
      lastWithdrawl,
      identifier,
      identityBalance,
      epochInfo
    )
  }
}
