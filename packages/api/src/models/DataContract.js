module.exports = class DataContract {
    identifier
    version

    constructor(identifier, version) {
        this.identifier = identifier;
        this.version = version;
    }

    static fromJSON({identifier, version}) {
        return new DataContract(identifier, version)
    }
}
