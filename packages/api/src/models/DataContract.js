module.exports = class DataContract {
    identifier

    constructor(identifier) {
        this.identifier = identifier;
    }

    static fromJSON({identifier}) {
        return new DataContract(identifier)
    }
}
