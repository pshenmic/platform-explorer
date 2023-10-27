module.exports = class Document {
    identifier
    dataContractIdentifier
    revision
    txHash
    deleted
    data
    timestamp

    constructor(identifier, dataContractIdentifier, revision, txHash, deleted, data, timestamp) {
        this.identifier = identifier;
        this.dataContractIdentifier = dataContractIdentifier;
        this.revision = revision;
        this.deleted = deleted;
        this.data = data;
        this.txHash = txHash;
        this.data = data;
        this.timestamp = timestamp;
    }

    static fromRow({identifier, data_contract_identifier, revision, tx_hash, deleted, data, timestamp}) {
        return new Document(identifier, data_contract_identifier, revision, tx_hash, deleted, data, timestamp)
    }
}
