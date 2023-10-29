module.exports = class Document {
    identifier
    dataContractIdentifier
    revision
    txHash
    deleted
    data
    timestamp

    constructor(identifier, dataContractIdentifier, revision, txHash, deleted, data, timestamp) {
        this.identifier = identifier ?? null;
        this.dataContractIdentifier = dataContractIdentifier ?? null;
        this.revision = revision ?? null;
        this.deleted = deleted ?? null;
        this.data = data ?? null;
        this.txHash = txHash ?? null;
        this.data = data ?? null;
        this.timestamp = timestamp ?? null;
    }

    static fromRow({identifier, data_contract_identifier, revision, tx_hash, deleted, data, timestamp}) {
        return new Document(identifier, data_contract_identifier, revision, tx_hash, deleted, data, timestamp)
    }
}
