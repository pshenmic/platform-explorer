const BlockHeader = require("./BlockHeader");

module.exports = class Block {
    header
    txs

    constructor(header, txs) {
        this.header = header;
        this.txs = txs;
    }

    static fromJSON({header, txs}) {
        return new Block(BlockHeader.fromJSON(header), txs)
    }
}
