module.exports = class Withdrawal {
  id
  amount
  owner
  txHash
  timestamp
  blockHash

  constructor (amount, owner, txHash, timestamp, blockHash) {
    this.amount = amount ?? null
    this.owner = owner ? owner.trim() : null
    this.txHash = txHash ?? null
    this.timestamp = timestamp ?? null
    this.blockHash = blockHash ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ amount, owner, tx_hash, timestamp, block_hash }) {
    return new Withdrawal(parseInt(amount), owner, tx_hash, timestamp, block_hash)
  }
}
