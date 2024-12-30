module.exports = class Document {
  identifier
  dataContractIdentifier
  revision
  txHash
  deleted
  data
  timestamp
  isSystem
  entropy
  prefundedBalance
  typeName

  constructor (identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, typeName, entropy, prefundedBalance) {
    this.identifier = identifier ? identifier.trim() : null
    this.owner = owner ? owner.trim() : null
    this.dataContractIdentifier = dataContractIdentifier ? dataContractIdentifier.trim() : null
    this.revision = revision ?? null
    this.deleted = deleted ?? null
    this.data = data ?? null
    this.txHash = txHash ?? null
    this.data = data ?? null
    this.timestamp = timestamp ?? null
    this.isSystem = isSystem ?? null
    this.entropy = entropy ?? null
    this.prefundedBalance = prefundedBalance ?? null
    this.typeName = typeName ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data, timestamp, is_system, document_type_name }) {
    return new Document(identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data ? JSON.stringify(data) : null, timestamp, is_system, document_type_name)
  }

  static fromObject ({ identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, typeName, entropy, prefundedBalance }) {
    return new Document(identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, typeName, entropy, prefundedBalance)
  }
}
