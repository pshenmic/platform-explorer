module.exports = class Validator {
    proTxHash

    constructor(proTxHash) {
        this.proTxHash = proTxHash;
    }

    static fromRow({pro_tx_hash}) {
        return new Validator(pro_tx_hash)
    }
}
