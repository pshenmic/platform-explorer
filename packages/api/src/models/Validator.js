module.exports = class Validator {
  proTxHash
  blocksCount
  propsedBlock
  constructor (
    proTxHash,
    latestHeight,
    latestTimestamp,
    blocksCount,
    blockHash,
    l1LockedHeight,
    appVersion,
    blockVersion
  ) {
    this.proTxHash = proTxHash
    this.blocksCount = Number(blocksCount)
    this.propsedBlock = {
      header: {
        hash: blockHash,
        height: latestHeight,
        timestamp: latestTimestamp,
        l1LockedHeight,
        appVersion,
        blockVersion
      }
    }
  }

  /* eslint-disable camelcase */
  static fromRow ({
    pro_tx_hash,
    latest_height,
    latest_timestamp,
    blocks_count,
    block_hash,
    l1_locked_height,
    app_version,
    block_version
  }) {
    return new Validator(
      pro_tx_hash,
      latest_height,
      latest_timestamp,
      blocks_count,
      block_hash,
      l1_locked_height,
      app_version,
      block_version
    )
  }
  /* eslint-disable camelcase */
}
