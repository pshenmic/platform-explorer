module.exports = class DataContract {
    identifier
    schema
    version

    constructor(identifier, schema, version) {
        this.identifier = identifier;
        this.schema = schema;
        this.version = version;
    }

    static fromRow({identifier, schema, version}) {
        return new DataContract(identifier, schema, version)
    }
}
