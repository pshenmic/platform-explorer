module.exports = class Validator {
  proTxHash
  latestHeight
  latestTimestamp
  blocksCount

  constructor(proTxHash, latestHeight, latestTimestamp, blocksCount) {
    this.proTxHash = proTxHash
    this.latestHeight = latestHeight
    this.latestTimestamp = latestTimestamp
    this.blocksCount = blocksCount
  }

  // eslint-disable-next-line camelcase
  static fromRow({ pro_tx_hash, latest_height, latest_timestamp, blocks_count }) {
    return new Validator(pro_tx_hash, latest_height, latest_timestamp, blocks_count)
  }
}
