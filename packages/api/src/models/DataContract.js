module.exports = class DataContract {
    identifier
    schema
    version
    txHash
    timestamp
    isSystem

    constructor(identifier, schema, version, txHash, timestamp, isSystem) {
        this.identifier = identifier ?? null;
        this.schema = schema ?? null;
        this.version = version ?? null;
        this.txHash = txHash ?? null;
        this.timestamp = timestamp ?? null;
        this.isSystem = isSystem ?? null;
    }

    static fromRow({identifier, schema, version, tx_hash, timestamp, is_system}) {
        return new DataContract(identifier, schema, version, tx_hash, timestamp, is_system)
    }
}
