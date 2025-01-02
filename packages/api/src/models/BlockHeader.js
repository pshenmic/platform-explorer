module.exports = class BlockHeader {
  hash
  height
  timestamp
  blockVersion
  appVersion
  l1LockedHeight
  validator
  totalGasUsed

  constructor (hash, height, timestamp, blockVersion, appVersion, l1LockedHeight, validator, totalGasUsed) {
    this.hash = hash ?? null
    this.height = height ?? null
    this.timestamp = timestamp ?? null
    this.blockVersion = blockVersion ?? null
    this.appVersion = appVersion ?? null
    this.l1LockedHeight = l1LockedHeight ?? null
    this.validator = validator ?? null
    this.totalGasUsed = totalGasUsed ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ hash, height, timestamp, block_version, app_version, l1_locked_height, validator, total_gas_used }) {
    return new BlockHeader(hash, height, new Date(timestamp), block_version, app_version, l1_locked_height, validator, Number(total_gas_used))
  }
}
