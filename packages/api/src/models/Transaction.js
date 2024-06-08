module.exports = class Transaction {
  hash
  index
  blockHash
  blockHeight
  type
  data
  timestamp
  gasUsed
  status
  error

  constructor (hash, index, blockHash, blockHeight, type, data, timestamp, gasUsed, status, error) {
    this.hash = hash ?? null
    this.index = index ?? null
    this.blockHash = blockHash ?? null
    this.blockHeight = blockHeight ?? null
    this.type = type ?? null
    this.data = data ?? null
    this.timestamp = timestamp ?? null
    this.gasUsed = gasUsed ?? null
    this.status = status ?? null
    this.error = error ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ tx_hash, index, block_hash, block_height, type, data, timestamp, gas_used, status, error }) {
    return new Transaction(tx_hash, index, block_hash, block_height, type, data, timestamp, parseInt(gas_used), status, error)
  }
}
