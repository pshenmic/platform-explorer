const BlockHeader = require('./BlockHeader')

module.exports = class Validator {
  proTxHash
  proposedBlocksAmount
  lastProposedBlockHeader

  constructor (proTxHash, proposedBlocksAmount, lastProposedBlockHeader) {
    this.proTxHash = proTxHash
    this.proposedBlocksAmount = Number(proposedBlocksAmount)
    this.lastProposedBlockHeader = lastProposedBlockHeader ?? null
  }

  /* eslint-disable camelcase */
  static fromRow ({
    pro_tx_hash,
    proposed_blocks_amount,
    last_proposed_block_header
  }) {
    return new Validator(
      pro_tx_hash,
      proposed_blocks_amount,
      last_proposed_block_header ? BlockHeader.fromRow(last_proposed_block_header) : null
    )
  }
  /* eslint-disable camelcase */
}
