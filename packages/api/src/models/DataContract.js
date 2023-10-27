module.exports = class DataContract {
    identifier
    schema
    version
    txHash

    constructor(identifier, schema, version, txHash, timestamp) {
        this.identifier = identifier;
        this.schema = schema;
        this.version = version;
        this.txHash = txHash;
        this.timestamp = timestamp;
    }

    static fromRow({identifier, schema, version, tx_hash, timestamp}) {
        return new DataContract(identifier, schema, version, tx_hash, timestamp)
    }
}
