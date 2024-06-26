module.exports = class Validator {
  proTxHash
  isActive

  constructor (proTxHash, isActive) {
    this.proTxHash = proTxHash ?? null
    this.isActive = isActive ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ pro_tx_hash, is_active }) {
    return new Validator(pro_tx_hash, is_active)
  }
}
