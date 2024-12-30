module.exports = class DocumentTransaction {
  revision
  gasUsed
  owner
  hash
  timestamp
  transitionType
  data

  constructor (revision, gasUsed, owner, hash, timestamp, transitionType, data) {
    this.revision = revision ?? null
    this.gasUsed = gasUsed ?? null
    this.owner = owner ?? null
    this.hash = hash ?? null
    this.timestamp = timestamp ?? null
    this.transitionType = transitionType ?? null
    this.data = data ?? null
  }

  /* eslint-disable-next-line camelcase */
  static fromRow ({ revision, gas_used, owner, hash, timestamp, transition_type, data, total_count }) {
    return new DocumentTransaction(Number(revision), Number(gas_used), owner?.trim(), hash, timestamp, Number(transition_type), data, Number(total_count))
  }
}
