module.exports = class BlockHeader {
    hash
    height
    timestamp
    block_version
    app_version
    l1_locked_height
    chain

    constructor(hash, height, timestamp, blockVersion, appVersion, l1LockedHeight, chain) {
        this.hash = hash;
        this.height = height;
        this.timestamp = timestamp;
        this.blockVersion = blockVersion;
        this.appVersion = appVersion;
        this.l1LockedHeight = l1LockedHeight;
        this.chain = chain;
    }

    static fromJSON({hash, height, timestamp, block_version, app_version, l1_locked_height, chain}) {
        return new BlockHeader(hash, height, new Date(timestamp), block_version, app_version, l1_locked_height, chain)
    }
}
