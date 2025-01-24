module.exports = class Alias {
  alias
  status
  contested
  timestamp

  constructor (alias, status, contested, timestamp) {
    this.alias = alias ?? null
    this.status = status ?? null
    this.contested = contested ?? null
    this.timestamp = timestamp ?? null
  }

  static fromObject ({ alias, status, contested, timestamp }) {
    return new Alias(alias, status, contested, timestamp)
  }
}
