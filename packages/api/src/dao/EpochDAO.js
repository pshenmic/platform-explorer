const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')
const Constants = require('../constants')

module.exports = class EpochDAO {
  constructor (knex) {
    this.blocksDAO = new BlocksDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.knex = knex
  }

  getEpochByIndex = async (index, currentBlock) => {
    const epoch = Epoch.fromObject({
      index,
      genesisTime: Constants.genesisTime,
      timestamp: currentBlock.header.timestamp
    })

    const subquery = this.knex('state_transitions')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .whereRaw(`blocks.timestamp > '${epoch.startTime.toISOString()}' and blocks.timestamp <= '${epoch.endTime.toISOString()}'`)
      .count('* as tx_count')

    const [row] = await this.knex
      .select(this.knex.raw(`SUM(tx_count) * 1.0 / ${Constants.EPOCH_CHANGE_TIME / 1000} as tps`))
      .from(subquery)

    return {
      epoch,
      tps: Number(row.tps)
    }
  }
}
