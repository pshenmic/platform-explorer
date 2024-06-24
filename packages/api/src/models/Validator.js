module.exports = class Validator {
  proTxHash
  blocksCount
  lastProposedBlockHeader
  constructor (
    proTxHash,
    latestHeight,
    latestTimestamp,
    blocksCount,
    blockHash,
    l1LockedHeight,
    appVersion,
    blockVersion
  ) {
    this.proTxHash = proTxHash
    this.blocksCount = Number(blocksCount)
    this.lastProposedBlockHeader = blockHash
      ? {
          hash: blockHash,
          height: latestHeight,
          timestamp: latestTimestamp,
          l1LockedHeight,
          appVersion,
          blockVersion
        }
      : null
  }
  // хедер оставь
  // мы транзакции не грузим
  // и не пропозд
  // а lastProposedBlock
  // можно lastProposedBlockHeader
  // Вебкам-форель [bmd.GG] — Сегодня, в 20:11
  // хорошо
  // pshenmic — Сегодня, в 20:11
  // все равно не правильно
  // ну вернее
  // короче сделаешь чтобы опциональное поле было
  // pshenmic — Сегодня, в 20:11
  // по этому полю проверяй
  // либо нулл, либо объект типа блокхедер

  /* eslint-disable camelcase */
  static fromRow ({
    pro_tx_hash,
    latest_height,
    latest_timestamp,
    blocks_count,
    block_hash,
    l1_locked_height,
    app_version,
    block_version
  }) {
    return new Validator(
      pro_tx_hash,
      latest_height,
      latest_timestamp,
      blocks_count,
      block_hash,
      l1_locked_height,
      app_version,
      block_version
    )
  }
  /* eslint-disable camelcase */
}
