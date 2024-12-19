module.exports = class Transfer {
  id
  amount
  sender
  recipient
  timestamp
  txHash
  type
  blockHash
  gasUsed

  constructor (amount, sender, recipient, timestamp, txHash, type, blockHash, gasUsed) {
    this.amount = amount ?? null
    this.sender = sender ? sender.trim() : null
    this.recipient = recipient ? recipient.trim() : null
    this.timestamp = timestamp ?? null
    this.txHash = txHash ?? null
    this.type = type ?? null
    this.blockHash = blockHash ?? null
    this.gasUsed = gasUsed ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ amount, sender, recipient, timestamp, tx_hash, type, block_hash, gas_used }) {
    return new Transfer(parseInt(amount), sender, recipient, timestamp, tx_hash, type, block_hash, Number(gas_used))
  }
}
