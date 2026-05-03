module.exports = class PlatformAddress {
  base58Address
  bech32mAddress
  totalTxs
  incomingTxs
  outgoingTxs
  nonce
  balance
  totalIncomingAmount
  totalOutgoingAmount

  constructor (base58Address, bech32mAddress, totalTxs, incomingTxs, outgoingTxs, totalIncomingAmount, totalOutgoingAmount, nonce, balance) {
    this.base58Address = base58Address ?? null
    this.bech32mAddress = bech32mAddress ?? null
    this.totalTxs = totalTxs ?? null
    this.incomingTxs = incomingTxs ?? null
    this.outgoingTxs = outgoingTxs ?? null
    this.nonce = nonce ?? null
    this.balance = balance ?? null
    this.totalIncomingAmount = totalIncomingAmount ?? null
    this.totalOutgoingAmount = totalOutgoingAmount ?? null
  }

  // eslint-disable-next-line
  static fromRow({base58_address, bech32m_address, total_txs, incoming_txs, outgoing_txs, total_incoming_amount, total_outgoing_amount}) {
    return new PlatformAddress(base58_address, bech32m_address, Number(total_txs), Number(incoming_txs), Number(outgoing_txs), total_incoming_amount, total_outgoing_amount)
  }

  static fromObject ({ base58Address, bech32mAddress, totalTxs, incomingTxs, outgoingTxs, nonce, balance, totalIncomingAmount, totalOutgoingAmount }) {
    return new PlatformAddress(base58Address, bech32mAddress, totalTxs, incomingTxs, outgoingTxs, totalIncomingAmount, totalOutgoingAmount, nonce, balance)
  }
}
