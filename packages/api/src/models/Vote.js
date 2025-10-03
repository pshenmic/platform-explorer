module.exports = class Vote {
  proTxHash
  txHash
  voterIdentifier
  choice
  timestamp
  towardsIdentity
  identityAliases
  dataContractIdentifier
  documentTypeName
  documentIdentifier
  indexName
  indexValues
  power

  constructor (proTxHash, txHash, voterIdentifier, choice, timestamp, towardsIdentity, identityAliases, dataContractIdentifier, documentTypeName, indexName, indexValues, power, documentIdentifier) {
    this.proTxHash = proTxHash ?? null
    this.txHash = txHash ?? null
    this.voterIdentifier = voterIdentifier ?? null
    this.choice = choice ?? null
    this.timestamp = timestamp ?? null
    this.towardsIdentity = towardsIdentity ?? null
    this.identityAliases = identityAliases ?? null
    this.dataContractIdentifier = dataContractIdentifier ?? null
    this.documentTypeName = documentTypeName ?? null
    this.indexName = indexName ?? null
    this.indexValues = indexValues ?? null
    this.power = power ?? null
    this.documentIdentifier = documentIdentifier ?? null
  }

  /* eslint-disable camelcase */
  static fromRow ({ pro_tx_hash, state_transition_hash, voter_identity_id, choice, timestamp, towards_identity_identifier, data_contract_identifier, document_type_name, index_name, index_values, aliases, power, document_identifier }) {
    return new Vote(pro_tx_hash?.toLowerCase(), state_transition_hash, voter_identity_id?.trim(), choice, timestamp, towards_identity_identifier?.trim(), aliases, data_contract_identifier, document_type_name?.trim(), index_name?.trim(), index_values, power, document_identifier?.trim())
  }
}
