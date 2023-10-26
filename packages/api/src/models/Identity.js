module.exports = class Identity {
    identifier
    revision
    balance
    timestamp
    totalTxs

    constructor(identifier, revision, balance, timestamp, totalTxs) {
        this.identifier = identifier;
        this.revision = revision;
        this.balance = balance;
        this.timestamp = timestamp;
        this.totalTxs = totalTxs;
    }

    static fromRow({identifier, revision, balance, timestamp, total_txs}) {
        return new Identity(identifier, revision, balance, timestamp, total_txs)
    }
}
