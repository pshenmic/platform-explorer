module.exports = class Document {
  identifier
  dataContractIdentifier
  revision
  txHash
  deleted
  data
  timestamp
  system
  entropy
  prefundedVotingBalance
  documentTypeName
  transitionType
  nonce

  constructor (identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, documentTypeName, transitionType, prefundedVotingBalance, entropy, nonce) {
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
    this.documentTypeName = documentTypeName ?? null
    this.transitionType = transitionType ?? null
    this.entropy = entropy ?? null
    this.prefundedVotingBalance = prefundedVotingBalance ?? null
    this.nonce = nonce ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data, timestamp, is_system, document_type_name, transition_type, prefunded_voting_balance }) {
    return new Document(identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data ? JSON.stringify(data) : null, timestamp, is_system, document_type_name, Number(transition_type), prefunded_voting_balance)
  }

  static fromObject ({ identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, documentTypeName, transitionType, entropy, prefundedVotingBalance, nonce }) {
    return new Document(identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, documentTypeName, transitionType, prefundedVotingBalance, entropy, nonce)
  }
}
