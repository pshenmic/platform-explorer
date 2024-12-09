module.exports = class Identity {
  identifier
  revision
  balance
  timestamp
  txHash
  totalTxs
  totalTransfers
  totalDocuments
  totalDataContracts
  isSystem
  aliases
  totalGasSpent
  averageGasSpent
  topUpsGasSpent
  withdrawalsGasSpent
  lastWithdrawalHash
  publicKeys
  fundingCoreTx

  constructor (
    identifier, owner, revision,
    balance, timestamp, totalTxs,
    totalDataContracts, totalDocuments,
    totalTransfers, txHash, isSystem,
    aliases, totalGasSpent, averageGasSpent,
    topUpsGasSpent, withdrawalsGasSpent,
    lastWithdrawalHash, publicKeys, fundingCoreTx
  ) {
    this.identifier = identifier ? identifier.trim() : null
    this.owner = owner ? owner.trim() : null
    this.revision = revision ?? null
    this.balance = balance ?? null
    this.timestamp = timestamp ?? null
    this.totalTxs = totalTxs ?? null
    this.totalDocuments = totalDocuments ?? null
    this.totalDataContracts = totalDataContracts ?? null
    this.totalTransfers = totalTransfers ?? null
    this.txHash = txHash ?? null
    this.isSystem = isSystem ?? null
    this.aliases = aliases ?? []
    this.totalGasSpent = totalGasSpent ?? null
    this.averageGasSpent = averageGasSpent ?? null
    this.topUpsGasSpent = topUpsGasSpent ?? null
    this.withdrawalsGasSpent = withdrawalsGasSpent ?? null
    this.lastWithdrawalHash = lastWithdrawalHash ?? null
    this.publicKeys = publicKeys ?? []
    this.fundingCoreTx = fundingCoreTx ?? null
  }

  static fromObject ({
    identifier, owner, revision,
    balance, timestamp, totalTxs,
    totalDataContracts, totalDocuments,
    totalTransfers, txHash, isSystem,
    aliases, totalGasSpent, averageGasSpent,
    topUpsGasSpent, withdrawalsGasSpent,
    lastWithdrawalHash, publicKeys, fundingCoreTx
  }) {
    return new Identity(
      identifier,
      owner,
      revision,
      balance,
      timestamp,
      totalTxs,
      totalDataContracts,
      totalDocuments,
      totalTransfers,
      txHash,
      isSystem,
      aliases,
      totalGasSpent,
      averageGasSpent,
      topUpsGasSpent,
      withdrawalsGasSpent,
      lastWithdrawalHash,
      publicKeys,
      fundingCoreTx
    )
  }

  /* eslint-disable camelcase */
  static fromRow ({
    identifier, owner, revision,
    balance, timestamp, total_txs,
    total_data_contracts, total_documents,
    total_transfers, tx_hash, is_system,
    aliases, total_gas_spent, average_gas_spent,
    top_ups_gas_spent, withdrawals_gas_spent,
    last_withdrawal_hash
  }) {
    return new Identity(
      identifier?.trim(),
      owner,
      revision,
      Number(balance),
      timestamp,
      Number(total_txs),
      Number(total_data_contracts),
      Number(total_documents),
      Number(total_transfers),
      tx_hash,
      is_system,
      aliases,
      Number(total_gas_spent),
      Number(average_gas_spent),
      Number(top_ups_gas_spent),
      Number(withdrawals_gas_spent),
      last_withdrawal_hash
    )
  }
}
