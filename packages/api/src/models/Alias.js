module.exports = class Alias {
  alias
  status
  contested
  timestamp
  txHash

  constructor (alias, status, contested, timestamp, txHash) {
    this.alias = alias ?? null
    this.status = status ?? null
    this.contested = contested ?? null
    this.timestamp = timestamp ?? null
    this.txHash = txHash ?? null
  }

  static fromObject ({ alias, status, contested, timestamp, txHash }) {
    return new Alias(alias, status, contested, timestamp, txHash)
  }
}
