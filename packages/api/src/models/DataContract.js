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
  topIdentity
  identitiesInteracted
  totalGasUsed
  averageGasUsed

  constructor (identifier, name, owner, schema, version, txHash, timestamp, isSystem, documentsCount, topIdentity, identitiesInteracted, totalGasUsed, averageGasUsed) {
    this.identifier = identifier ? identifier.trim() : null
    this.name = name ? name.trim() : null
    this.owner = owner ?? null
    this.schema = schema ?? null
    this.version = version ?? null
    this.txHash = txHash ?? null
    this.timestamp = timestamp ?? null
    this.isSystem = isSystem ?? null
    this.documentsCount = documentsCount ?? null
    this.topIdentity = topIdentity ?? null
    this.identitiesInteracted = identitiesInteracted ?? null
    this.totalGasUsed = totalGasUsed ?? null
    this.averageGasUsed = averageGasUsed ?? null
  }

  /* eslint-disable camelcase */
  static fromRow ({ identifier, name, owner, schema, version, tx_hash, timestamp, is_system, documents_count, top_identity, identities_interacted, total_gas_used, average_gas_used }) {
    return new DataContract(identifier, name, typeof owner === 'string' ? owner.trim() : owner, schema ? JSON.stringify(schema) : null, version, tx_hash, timestamp, is_system, Number(documents_count), typeof top_identity === 'string' ? top_identity.trim() : top_identity, Number(identities_interacted), Number(total_gas_used), Number(average_gas_used))
  }
}
