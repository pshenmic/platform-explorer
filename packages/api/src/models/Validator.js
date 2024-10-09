/* eslint-disable camelcase */
const BlockHeader = require('./BlockHeader')
const Base58 = require('bs58').default

module.exports = class Validator {
  proTxHash
  isActive
  proposedBlocksAmount
  lastProposedBlockHeader
  proTxInfo
  identity
  identityBalance
  epochInfo
  totalReward
  epochReward

  constructor (
    proTxHash,
    isActive,
    proposedBlocksAmount,
    lastProposedBlockHeader,
    proTxInfo,
    totalReward,
    epochReward,
    identity,
    identityBalance,
    epochInfo,
  ) {
    this.proTxHash = proTxHash ?? null
    this.isActive = isActive ?? null
    this.proposedBlocksAmount = proposedBlocksAmount ?? null
    this.lastProposedBlockHeader = lastProposedBlockHeader ?? null
    this.proTxInfo = proTxInfo ?? null
    this.identity = identity ?? null
    this.identityBalance = identityBalance ?? null
    this.epochInfo = epochInfo ?? null
    this.totalReward = totalReward ?? null
    this.epochReward = epochReward ?? null
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
    total_collected_reward_by_epoch
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
      Number(total_collected_reward_by_epoch)
    )
  }
}
