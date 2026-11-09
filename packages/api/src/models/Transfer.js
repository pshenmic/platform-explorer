const cbor = require('cbor')
const { ConsensusErrorWASM } = require('pshenmic-dpp')

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
  status
  error

  constructor (amount, sender, recipient, timestamp, txHash, type, blockHash, gasUsed, status, error) {
    this.amount = amount != null ? String(amount) : null
    this.sender = sender ? sender.trim() : null
    this.recipient = recipient ? recipient.trim() : null
    this.timestamp = timestamp ?? null
    this.txHash = txHash ?? null
    this.type = type ?? null
    this.blockHash = blockHash ?? null
    this.gasUsed = gasUsed ?? null
    this.status = status ?? null
    this.error = error ?? null
  }

  // eslint-disable-next-line camelcase
  static fromRow ({ amount, sender, recipient, timestamp, tx_hash, type, block_hash, gas_used, status, error }) {
    let decodedError = null

    try {
      if (typeof error === 'string') {
        const { serializedError } = cbor.decode(Buffer.from(error, 'base64'))?.data
        decodedError = ConsensusErrorWASM.deserialize(new Uint8Array(serializedError))?.message
      }
    } catch (e) {
      console.error(e)
      decodedError = 'Cannot deserialize'
    }

    return new Transfer(amount, sender, recipient, timestamp, tx_hash, type, block_hash, Number(gas_used), status, decodedError ?? error)
  }
}
