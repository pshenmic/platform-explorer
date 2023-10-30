module.exports = class BlockHeader {
    hash
    height
    timestamp
    block_version
    app_version
    l1_locked_height

    constructor(hash, height, timestamp, blockVersion, appVersion, l1LockedHeight) {
        this.hash = hash ?? null;
        this.height = height ?? null;
        this.timestamp = timestamp ?? null;
        this.blockVersion = blockVersion ?? null;
        this.appVersion = appVersion ?? null;
        this.l1LockedHeight = l1LockedHeight ?? null;
    }

    static fromRow({hash, height, timestamp, block_version, app_version, l1_locked_height}) {
        return new BlockHeader(hash, height, new Date(timestamp), block_version, app_version, l1_locked_height)
    }
}
