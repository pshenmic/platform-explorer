const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')
const Constants = require('../constants')
const EpochData = require('../models/EpochData')

module.exports = class EpochDAO {
  constructor(knex) {
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

    const bestValidator = this.knex('blocks')
      .select('validator')
      .count('* as rating')
      .where('timestamp', '>', epoch.startTime.toISOString())
      .andWhere('timestamp', '<=', epoch.endTime.toISOString())
      .groupBy('validator')
      .as('bestValidator')

    const subquery = this.knex('state_transitions')
      .select(
        'validators.pro_tx_hash',
        this.knex.raw('ROW_NUMBER() OVER (ORDER BY COUNT(blocks.hash) DESC) as row_num')
      )
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .leftJoin('validators', 'blocks.validator', 'validators.pro_tx_hash')
      .sum('gas_used as collected_fees')
      .count('* as tx_count')
      .where('blocks.timestamp', '>', epoch.startTime.toISOString())
      .andWhere('blocks.timestamp', '<=', epoch.endTime.toISOString())
      .groupBy('validators.pro_tx_hash')
      .as('subquery')

    const epochInfo = this.knex(subquery)
      .select(
        'tx_count',
        'collected_fees',
        'row_num',
        this.knex.raw('SUM(collected_fees) OVER () as total_collected_fees'),
        this.knex.raw(`SUM(tx_count) OVER () * 1.0 / ${Constants.EPOCH_CHANGE_TIME / 1000} as tps`)
      )
      .orderBy('row_num', 'asc')
      .limit(1)
      .as('epochInfo')

    const [row] = await this.knex(bestValidator)
      .orderBy('rating', 'desc')
      .limit(1)
      .select(
        'validator as best_validator',
        this.knex(epochInfo).select('tx_count').as('tx_count'),
        this.knex(epochInfo).select('total_collected_fees').as('total_collected_fees'),
        this.knex(epochInfo).select('tps').as('tps'),
      )

    return EpochData.fromObject({ epoch, ...row })
  }
}
