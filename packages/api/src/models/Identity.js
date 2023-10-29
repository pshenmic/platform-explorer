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

    constructor(identifier, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash) {
        this.identifier = identifier ?? null;
        this.revision = revision ?? null;
        this.balance = balance ?? null;
        this.timestamp = timestamp ?? null;
        this.totalTxs = totalTxs ?? null;
        this.totalDocuments = totalDocuments ?? null;
        this.totalDataContracts = totalDataContracts ?? null;
        this.totalTransfers = totalTransfers ?? null;
        this.txHash = txHash ?? null;
    }

    static fromRow({identifier, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash}) {
        return new Identity(identifier, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash)
    }
}
