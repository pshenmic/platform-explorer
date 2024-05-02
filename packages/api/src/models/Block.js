const BlockHeader = require('./BlockHeader')

module.exports = class Block {
  header
  txs

  constructor (header, txs) {
    this.header = header ?? null
    this.txs = txs ?? null
  }

  static fromRow ({ header, txs }) {
    return new Block(BlockHeader.fromRow(header), txs)
  }
}
