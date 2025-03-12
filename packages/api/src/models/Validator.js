/* eslint-disable camelcase */
const BlockHeader = require('./BlockHeader')

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
  withdrawalsCount
  lastWithdrawal
  lastWithdrawalTime
  endpoints

  constructor (
    proTxHash,
    isActive,
    proposedBlocksAmount,
    lastProposedBlockHeader,
    proTxInfo,
    totalReward,
    epochReward,
    withdrawalsCount,
    lastWithdrawal,
    lastWithdrawalTime,
    identity,
    identityBalance,
    epochInfo,
    endpoints
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
    this.withdrawalsCount = withdrawalsCount ?? null
    this.lastWithdrawal = lastWithdrawal ?? null
    this.lastWithdrawalTime = lastWithdrawalTime ?? null
    this.endpoints = endpoints ?? null
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
    withdrawals_count,
    last_withdrawal,
    last_withdrawal_time,
    app_hash
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
          validator: pro_tx_hash,
          app_hash
        })
        : null,
      null,
      Number(total_collected_reward),
      Number(total_collected_reward_by_epoch),
      Number(withdrawals_count),
      last_withdrawal,
      last_withdrawal_time
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
    withdrawalsCount,
    lastWithdrawal,
    lastWithdrawalTime,
    identity,
    identityBalance,
    epochInfo,
    endpoints
  }) {
    return new Validator(
      proTxHash,
      isActive,
      proposedBlocksAmount,
      lastProposedBlockHeader,
      proTxInfo,
      totalReward,
      epochReward,
      withdrawalsCount,
      lastWithdrawal,
      lastWithdrawalTime,
      identity,
      identityBalance,
      epochInfo,
      endpoints
    )
  }
}
