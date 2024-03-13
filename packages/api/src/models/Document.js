module.exports = class Document {
    identifier
    dataContractIdentifier
    revision
    txHash
    deleted
    data
    timestamp
    isSystem

    constructor(identifier, owner, dataContractIdentifier, revision, txHash, deleted, data, timestamp, isSystem) {
        this.identifier = identifier ? identifier.trim() : null;
        this.owner = owner ? owner.trim() : null;
        this.dataContractIdentifier = dataContractIdentifier ? dataContractIdentifier.trim() : null;
        this.revision = revision ?? null;
        this.deleted = deleted ?? null;
        this.data = data ?? null;
        this.txHash = txHash ?? null;
        this.data = data ?? null;
        this.timestamp = timestamp ?? null;
        this.isSystem = isSystem ?? null;
    }

    static fromRow({identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data, timestamp, is_system}) {
        return new Document(identifier, owner, data_contract_identifier, revision, tx_hash, deleted, data ? JSON.stringify(data) : null, timestamp, is_system)
    }
}
