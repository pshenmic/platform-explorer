module.exports = class ContestedResource {
  contenders
  indexName
  resourceValue
  dataContractIdentifier
  prefundedVotingBalance
  documentTypeName
  timestamp
  totalGasUsed
  totalDocumentsGasUsed
  totalVotesGasUsed
  totalCountVotes
  totalCountLock
  totalCountAbstain
  totalCountTowardsIdentity
  status
  endTimestamp
  finished
  towardsIdentity

  constructor (contenders, indexName, resourceValue, dataContractIdentifier, prefundedVotingBalance, documentTypeName, timestamp, totalGasUsed, totalDocumentsGasUsed, totalVotesGasUsed, totalCountVotes, totalCountLock, totalCountAbstain, totalCountTowardsIdentity, status, endTimestamp, finished, towardsIdentity) {
    this.contenders = contenders ?? null
    this.indexName = indexName ?? null
    this.resourceValue = resourceValue ?? null
    this.dataContractIdentifier = dataContractIdentifier ?? null
    this.prefundedVotingBalance = prefundedVotingBalance ?? null
    this.documentTypeName = documentTypeName ?? null
    this.timestamp = timestamp ?? null
    this.totalGasUsed = totalGasUsed ?? null
    this.totalVotesGasUsed = totalVotesGasUsed ?? null
    this.totalDocumentsGasUsed = totalDocumentsGasUsed ?? null
    this.totalCountVotes = totalCountVotes ?? null
    this.totalCountLock = totalCountLock ?? null
    this.totalCountAbstain = totalCountAbstain ?? null
    this.totalCountTowardsIdentity = totalCountTowardsIdentity ?? null
    this.status = status ?? null
    this.endTimestamp = endTimestamp ?? null
    this.finished = finished ?? null
    this.towardsIdentity = towardsIdentity ?? null
  }

  /* eslint-disable camelcase */
  static fromRaw ({
    contenders,
    index_name,
    resource_value,
    data_contract_identifier,
    prefunded_voting_balance,
    document_type_name,
    timestamp,
    totalGasUsed,
    totalDocumentsGasUsed,
    totalVotesGasUsed,
    totalCountVotes,
    totalCountLock,
    totalCountAbstain,
    totalCountTowardsIdentity,
    status,
    endTimestamp
  }) {
    const isFinished = (new Date(endTimestamp).getTime() - new Date().getTime()) <= 0
    let towardsIdentity

    if (totalCountTowardsIdentity > 0) {
      [{ identifier: towardsIdentity }] = contenders?.toSorted().sort((a, b) => b.towardsIdentityVotes - a.towardsIdentityVotes) ?? [{ identifier: undefined }]
    }

    return new ContestedResource(contenders, index_name, resource_value, data_contract_identifier?.trim(), prefunded_voting_balance, document_type_name, timestamp, totalGasUsed, totalDocumentsGasUsed, totalVotesGasUsed, totalCountVotes, totalCountLock, totalCountAbstain, totalCountTowardsIdentity, status ? 'finished' : 'pending', endTimestamp, isFinished, towardsIdentity)
  }

  static fromObject ({ contenders, indexName, resourceValue, dataContractIdentifier, prefundedVotingBalance, documentTypeName, timestamp, totalGasUsed, totalDocumentsGasUsed, totalVotesGasUsed, totalCountVotes, totalCountLock, totalCountAbstain, totalCountTowardsIdentity, status, endTimestamp }) {
    const isFinished = (new Date(endTimestamp).getTime() - new Date().getTime()) <= 0
    let towardsIdentity

    if (totalCountTowardsIdentity > 0) {
      [{ identifier: towardsIdentity }] = contenders?.toSorted().sort((a, b) => b.towardsIdentityVotes - a.towardsIdentityVotes) ?? [{ identifier: undefined }]
    }

    return new ContestedResource(contenders, indexName, resourceValue, dataContractIdentifier?.trim(), prefundedVotingBalance, documentTypeName, timestamp, totalGasUsed, totalDocumentsGasUsed, totalVotesGasUsed, totalCountVotes, totalCountLock, totalCountAbstain, totalCountTowardsIdentity, status, endTimestamp, isFinished, towardsIdentity)
  }
}
