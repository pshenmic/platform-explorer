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
  totalTopUpsAmount
  totalWithdrawalsAmount
  lastWithdrawalHash
  publicKeys
  fundingCoreTx
  totalTopUps
  totalWithdrawals
  lastWithdrawalTimestamp
  nonce

  constructor (
    identifier, owner, revision,
    balance, timestamp, totalTxs,
    totalDataContracts, totalDocuments,
    totalTransfers, txHash, isSystem,
    aliases, totalGasSpent, averageGasSpent,
    totalTopUpsAmount, totalWithdrawalsAmount,
    lastWithdrawalHash, lastWithdrawalTimestamp,
    totalTopUps, totalWithdrawals, publicKeys,
    fundingCoreTx, nonce
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
    this.totalTopUpsAmount = totalTopUpsAmount ?? null
    this.totalWithdrawalsAmount = totalWithdrawalsAmount ?? null
    this.lastWithdrawalHash = lastWithdrawalHash ?? null
    this.publicKeys = publicKeys ?? []
    this.fundingCoreTx = fundingCoreTx ?? null
    this.totalTopUps = totalTopUps ?? null
    this.totalWithdrawals = totalWithdrawals ?? null
    this.lastWithdrawalTimestamp = lastWithdrawalTimestamp ?? null
    this.nonce = nonce ?? null
  }

  static fromObject ({
    identifier, owner, revision,
    balance, timestamp, totalTxs,
    totalDataContracts, totalDocuments,
    totalTransfers, txHash, isSystem,
    aliases, totalGasSpent, averageGasSpent,
    totalTopUpsAmount, totalWithdrawalsAmount,
    lastWithdrawalHash, publicKeys, fundingCoreTx,
    totalTopUps, totalWithdrawals, lastWithdrawalTimestamp, nonce
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
      totalTopUpsAmount,
      totalWithdrawalsAmount,
      lastWithdrawalHash,
      lastWithdrawalTimestamp,
      totalTopUps,
      totalWithdrawals,
      publicKeys,
      fundingCoreTx,
      nonce
    )
  }

  /* eslint-disable camelcase */
  static fromRow ({
    identifier, owner, revision,
    balance, timestamp, total_txs,
    total_data_contracts, total_documents,
    total_transfers, tx_hash, is_system,
    aliases, total_gas_spent, average_gas_spent,
    total_top_ups_amount, total_withdrawals_amount,
    last_withdrawal_hash, last_withdrawal_timestamp,
    total_top_ups, total_withdrawals, nonce
  }) {
    return new Identity(
      identifier?.trim(),
      owner,
      revision,
      String(balance),
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
      Number(total_top_ups_amount),
      Number(total_withdrawals_amount),
      last_withdrawal_hash,
      last_withdrawal_timestamp,
      Number(total_top_ups),
      Number(total_withdrawals),
      undefined,
      undefined,
      nonce !== undefined ? String(nonce) : undefined
    )
  }
}
