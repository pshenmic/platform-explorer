module.exports = class BlockHeader {
    hash
    height
    timestamp
    block_version
    app_version
    l1_locked_height

    constructor(hash, height, timestamp, blockVersion, appVersion, l1LockedHeight) {
        this.hash = hash;
        this.height = height;
        this.timestamp = timestamp;
        this.blockVersion = blockVersion;
        this.appVersion = appVersion;
        this.l1LockedHeight = l1LockedHeight;
    }

    static fromRow({hash, height, timestamp, block_version, app_version, l1_locked_height}) {
        return new BlockHeader(hash, height, new Date(timestamp), block_version, app_version, l1_locked_height)
    }
}
