const cbor = require('cbor')
const {ConsensusErrorWASM} = require("pshenmic-dpp");

module.exports = class Transaction {
  hash
  index
  blockHash
  blockHeight
  type
  batchType
  data
  timestamp
  gasUsed
  status
  error
  owner

  constructor (hash, index, blockHash, blockHeight, type, batchType, data, timestamp, gasUsed, status, error, owner) {
    this.hash = hash ?? null
    this.index = index ?? null
    this.blockHash = blockHash ?? null
    this.blockHeight = blockHeight ?? null
    this.type = type ?? null
    this.batchType = batchType ?? null
    this.data = data ?? null
    this.timestamp = timestamp ?? null
    this.gasUsed = gasUsed ?? null
    this.status = status ?? null
    this.error = error ?? null
    this.owner = owner || null
  }

  /* eslint-disable camelcase */
  static fromRow ({
    tx_hash,
    index,
    block_hash,
    block_height,
    type,
    batch_type,
    data,
    timestamp,
    gas_used,
    status,
    error,
    owner,
    aliases
  }) {
    let decodedError = null

    try {
      if (typeof error === 'string') {
        const { serializedError } = cbor.decode(Buffer.from(error, 'base64'))?.data
        decodedError = ConsensusErrorWASM.deserialize(serializedError)?.message
      }
    } catch (e) {
      console.error(e)
      decodedError = 'Cannot deserialize'
    }

    return new Transaction(
      tx_hash, index, block_hash,
      block_height, type, batch_type, data,
      timestamp, parseInt(gas_used),
      status, decodedError ?? error,
      {
        identifier: owner?.trim(),
        aliases: aliases ?? []
      }
    )
  }
}
