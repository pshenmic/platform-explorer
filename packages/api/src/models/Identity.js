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

  constructor (identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem) {
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
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ identifier, owner, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash, is_system }) {
    return new Identity(identifier, owner, revision, Number(balance), timestamp, Number(total_txs), Number(total_data_contracts), Number(total_documents), Number(total_transfers), tx_hash, is_system)
  }

  static fromObject ({ identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem }) {
    return new Identity(identifier, owner, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash, isSystem)
  }
}
