module.exports = class Transaction {
    hash
    index
    block
    type
    data
    timestamp

    constructor(hash, index, blockHeight, type, data, timestamp) {
        this.hash = hash;
        this.index = index;
        this.blockHeight = blockHeight;
        this.type = type;
        this.data = data;
        this.timestamp = timestamp;
    }

    static fromJSON({hash, index, block_height, type, data, timestamp}) {
        return new Transaction(hash, index, block_height, type, data, timestamp)
    }
}
