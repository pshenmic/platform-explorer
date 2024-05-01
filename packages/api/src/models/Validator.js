module.exports = class Validator {
  proTxHash

  constructor (proTxHash) {
    this.proTxHash = proTxHash
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ pro_tx_hash }) {
    return new Validator(pro_tx_hash)
  }
}
