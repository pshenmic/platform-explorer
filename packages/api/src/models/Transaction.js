module.exports = class Transaction {
    hash
    index
    blockHash
    blockHeight
    type
    data
    timestamp

    constructor(hash, index, blockHash, blockHeight, type, data, timestamp) {
        this.hash = hash ?? null;
        this.index = index ?? null;
        this.blockHash = blockHash ?? null;
        this.blockHeight = blockHeight ?? null;
        this.type = type ?? null;
        this.data = data ?? null;
        this.timestamp = timestamp ?? null;
    }

    static fromRow({tx_hash, index, block_hash, block_height, type, data, timestamp}) {
        return new Transaction(tx_hash, index, block_hash, block_height, type, data, timestamp)
    }
}
