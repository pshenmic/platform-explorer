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

  constructor (
    proTxHash,
    isActive,
    proposedBlocksAmount,
    lastProposedBlockHeader,
    proTxInfo
  ) {
    this.proTxHash = proTxHash ?? null
    this.isActive = isActive ?? null
    this.proposedBlocksAmount = proposedBlocksAmount ?? null
    this.lastProposedBlockHeader = lastProposedBlockHeader ?? null
    this.proTxInfo = proTxInfo ?? null
    this.identity = proTxHash ? Base58.encode(Buffer.from(proTxHash, 'hex')) : null
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
    is_active
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
        : null
    )
  }
}
