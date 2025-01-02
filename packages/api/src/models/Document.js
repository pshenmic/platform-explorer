module.exports = class Document {
  identifier
  dataContractIdentifier
  revision
  txHash
  deleted
  data
  timestamp
  system
  typeName
  transitionType

  constructor (identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, typeName, transitionType) {
    this.identifier = identifier ? identifier.trim() : null
    this.owner = owner ? owner.trim() : null
    this.dataContractIdentifier = dataContractIdentifier ? dataContractIdentifier.trim() : null
    this.revision = revision ?? null
    this.deleted = deleted ?? null
    this.data = data ?? null
    this.txHash = txHash ?? null
    this.data = data ?? null
    this.timestamp = timestamp ?? null
    this.system = isSystem ?? null
    this.typeName = typeName ?? null
    this.transitionType = transitionType ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data, timestamp, is_system, document_type_name, transition_type }) {
    return new Document(identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data ? JSON.stringify(data) : null, timestamp, is_system, document_type_name, Number(transition_type))
  }

  static fromObject ({ identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, typeName, transitionType }) {
    return new Document(identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, typeName, transitionType)
  }
}
