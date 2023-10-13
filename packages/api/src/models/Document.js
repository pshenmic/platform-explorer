module.exports = class Document {
    identifier
    dataContractIdentifier
    revision
    stateTransitionHash
    deleted
    data

    constructor(identifier, dataContractIdentifier, revision, stateTransitionHash, deleted, data) {
        this.identifier = identifier;
        this.dataContractIdentifier = dataContractIdentifier;
        this.revision = revision;
        this.stateTransitionHash = stateTransitionHash;
        this.deleted = deleted;
        this.data = data;
    }

    static fromRow({identifier, data_contract_identifier, revision, state_transition_hash, deleted, data}) {
        return new Document(identifier, data_contract_identifier, revision, state_transition_hash, deleted, data)
    }
}
