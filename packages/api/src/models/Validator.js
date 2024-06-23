module.exports = class Validator {
  proTxHash
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
    this.propsedBlock = {
      header: {
        latestHeight,
        latestTimestamp,
        blocksCount: Number(blocksCount),
        blockHash,
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
