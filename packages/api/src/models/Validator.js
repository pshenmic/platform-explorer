const BlockHeader = require('./BlockHeader')

module.exports = class Validator {
  proTxHash
  proposedBlocksAmount
  lastProposedBlockHeader

  constructor (
    proTxHash,
    proposedBlocksAmount,
    lastProposedBlockHeader
  ) {
    this.proTxHash = proTxHash
    this.proposedBlocksAmount = Number(proposedBlocksAmount)
    this.lastProposedBlockHeader = lastProposedBlockHeader
  }

  /* eslint-disable camelcase */
  static fromRow ({
    pro_tx_hash,
    proposed_blocks_amount,
    latest_height,
    latest_timestamp,
    block_hash,
    l1_locked_height,
    app_version,
    block_version
  }) {
    return new Validator(
      pro_tx_hash,
      proposed_blocks_amount,
      block_hash
        ? BlockHeader.fromRow({
          hash: block_hash,
          height: latest_height,
          timestamp: latest_timestamp,
          block_version,
          app_version,
          l1_locked_height,
          validator: pro_tx_hash
        })
        : null
    )
  }
  /* eslint-disable camelcase */
}
