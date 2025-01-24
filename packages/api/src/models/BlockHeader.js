module.exports = class BlockHeader {
  hash
  height
  timestamp
  blockVersion
  appVersion
  l1LockedHeight
  validator
  totalGasUsed
  appHash

  constructor (hash, height, timestamp, blockVersion, appVersion, l1LockedHeight, validator, totalGasUsed, appHash) {
    this.hash = hash ?? null
    this.height = height ?? null
    this.timestamp = timestamp ?? null
    this.blockVersion = blockVersion ?? null
    this.appVersion = appVersion ?? null
    this.l1LockedHeight = l1LockedHeight ?? null
    this.validator = validator ?? null
    this.totalGasUsed = totalGasUsed ?? null
    this.appHash = appHash ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ hash, height, timestamp, block_version, app_version, l1_locked_height, validator, total_gas_used, app_hash }) {
    // eslint-disable-next-line camelcase
    return new BlockHeader(hash, height, new Date(timestamp), block_version, app_version, l1_locked_height, validator, Number(total_gas_used ?? 0), app_hash)
  }
}
