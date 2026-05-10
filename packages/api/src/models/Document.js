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
  identityContractNonce
  gasUsed
  totalGasUsed

  constructor (identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem, documentTypeName, transitionType, prefundedVotingBalance, gasUsed, totalGasUsed, entropy, identityContractNonce) {
    this.identifier = identifier ? identifier.trim() : null
    this.owner = owner ?? null
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
    this.identityContractNonce = identityContractNonce ?? null
    this.gasUsed = gasUsed ?? null
    this.totalGasUsed = totalGasUsed ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data, timestamp, is_system, document_type_name, transition_type, prefunded_voting_balance, gas_used: gasUsed, total_gas_used: totalGasUsed }) {
    return new Document(identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data ? JSON.stringify(data) : null, timestamp, is_system, document_type_name, transition_type, prefunded_voting_balance, gasUsed != null ? Number(gasUsed) : null, totalGasUsed != null ? Number(totalGasUsed) : null)
  }

  static fromObject ({ identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, documentTypeName, transitionType, entropy, prefundedVotingBalance, identityContractNonce, gasUsed, totalGasUsed }) {
    return new Document(identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, system, documentTypeName, transitionType, prefundedVotingBalance, gasUsed, totalGasUsed, entropy, identityContractNonce)
  }
}
