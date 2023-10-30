module.exports = class DataContract {
    identifier
    schema
    version
    txHash
    timestamp

    constructor(identifier, schema, version, txHash, timestamp) {
        this.identifier = identifier ?? null;
        this.schema = schema ?? null;
        this.version = version ?? null;
        this.txHash = txHash ?? null;
        this.timestamp = timestamp ?? null;
    }

    static fromRow({identifier, schema, version, tx_hash, timestamp}) {
        return new DataContract(identifier, schema, version, tx_hash, timestamp)
    }
}
