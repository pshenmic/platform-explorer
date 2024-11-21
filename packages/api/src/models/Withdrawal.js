const WithdrawalStatus = require('../enums/WithdrawalStatusEnum')

module.exports = class Withdrawal {
  timestamp
  hash
  sender
  id
  amount
  status

  constructor (timestamp, hash, sender, id, amount, status) {
    this.timestamp = timestamp ?? null
    this.hash = hash ?? null
    this.sender = sender ?? null
    this.id = id ?? null
    this.amount = amount ?? null
    this.status = status
      ? WithdrawalStatus[status]
      : null
  }

  static fromRaw (data = {}) {
    return new Withdrawal(data.$createdAt, null, data.$ownerId, data.$id, data.amount, data.status)
  }
}
