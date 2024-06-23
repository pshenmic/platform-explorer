module.exports = class Validator {
  proTxHash
  propsedBlock

  constructor(
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
        latestHeight: latestHeight,
        latestTimestamp: latestTimestamp,
        blocksCount: Number(blocksCount),
        blockHash: blockHash,
        l1LockedHeight: l1LockedHeight,
        appVersion: appVersion,
        blockVersion: blockVersion
      }
    }
  }

  // eslint-disable-next-line camelcase
  static fromRow({
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
}
