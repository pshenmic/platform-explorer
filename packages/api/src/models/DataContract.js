module.exports = class DataContract {
  identifier
  name
  owner
  schema
  version
  txHash
  timestamp
  isSystem
  documentsCount

  constructor (identifier, name, owner, schema, version, txHash, timestamp, isSystem, documentsCount) {
    this.identifier = identifier ? identifier.trim() : null
    this.name = name ? name.trim() : null
    this.owner = owner ? owner.trim() : null
    this.schema = schema ?? null
    this.version = version ?? null
    this.txHash = txHash ?? null
    this.timestamp = timestamp ?? null
    this.isSystem = isSystem ?? null
    this.documentsCount = documentsCount ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, name, owner, schema, version, tx_hash, timestamp, is_system, documents_count }) {
    return new DataContract(identifier, name, owner, schema ? JSON.stringify(schema) : null, version, tx_hash, timestamp, is_system, Number(documents_count))
  }
}
