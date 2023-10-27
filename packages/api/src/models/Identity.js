module.exports = class Identity {
    identifier
    revision
    balance
    timestamp
    totalTxs
    txHash

    constructor(identifier, revision, balance, timestamp, totalTxs, totalDataContracts, totalDocuments, totalTransfers, txHash) {
        this.identifier = identifier;
        this.revision = revision;
        this.balance = balance;
        this.timestamp = timestamp;
        this.totalTxs = totalTxs;
        this.totalDocuments = totalDocuments;
        this.totalDataContracts = totalDataContracts;
        this.totalTransfers = totalTransfers;
        this.txHash = txHash
    }

    static fromRow({identifier, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash}) {
        return new Identity(identifier, revision, balance, timestamp, total_txs, total_data_contracts, total_documents, total_transfers, tx_hash)
    }
}
