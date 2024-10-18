module.exports = class Transfer {
  id
  amount
  sender
  recipient
  timestamp
  txHash
  type

  constructor (amount, sender, recipient, timestamp, txHash, type) {
    this.amount = amount ?? null
    this.sender = sender ? sender.trim() : null
    this.recipient = recipient ? recipient.trim() : null
    this.timestamp = timestamp ?? null
    this.txHash = txHash ?? null
    this.type = type ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ amount, sender, recipient, timestamp, tx_hash, type}) {
    return new Transfer(parseInt(amount), sender, recipient, timestamp, tx_hash, type)
  }
}
