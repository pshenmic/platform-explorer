module.exports = class Identity {
  identifier
  revision
  balance
  timestamp
  txHash
  totalTxs
  totalTransfers
  totalDocuments
  totalDataContracts
  isSystem
  aliases

  constructor (identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem, aliases) {
    this.identifier = identifier ? identifier.trim() : null
    this.owner = owner ? owner.trim() : null
    this.revision = revision ?? null
    this.balance = balance ?? null
    this.timestamp = timestamp ?? null
    this.totalTxs = totalTxs ?? null
    this.totalDocuments = totalDocuments ?? null
    this.totalDataContracts = totalDataContracts ?? null
    this.totalTransfers = totalTransfers ?? null
    this.txHash = txHash ?? null
    this.isSystem = isSystem ?? null
    this.aliases = aliases ?? []
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash, is_system, aliases }) {
    return new Identity(identifier?.trim(), owner, revision, Number(balance), timestamp, Number(total_txs), Number(total_data_contracts), Number(total_documents), Number(total_transfers), tx_hash, is_system, aliases)
  }

  static fromObject ({ identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem, aliases }) {
    return new Identity(identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem, aliases)
  }
}
