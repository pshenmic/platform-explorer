const cbor = require('cbor')
const { ConsensusErrorWASM } = require('pshenmic-dpp')

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
  incoming
  base58Address
  bech32mAddress

  constructor (hash, index, blockHash, blockHeight, type, batchType, data, timestamp, gasUsed, status, error, owner, incoming, base58Address, bech32mAddress) {
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
    this.incoming = incoming ?? null
    this.base58Address = base58Address ?? null
    this.bech32mAddress = bech32mAddress ?? null
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
    aliases,
    incoming,
    base58_address,
    bech32m_address
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
        identifier: owner?.trim() ?? null,
        aliases: aliases ?? []
      },
      incoming, base58_address, bech32m_address
    )
  }
}
