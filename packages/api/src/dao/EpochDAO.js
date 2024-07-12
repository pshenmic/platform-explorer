const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')
const Constants = require('../constants')
const EpochData = require('../models/EpochData')

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
      .leftJoin('validators', 'blocks.validator', 'validators.pro_tx_hash')
      .where('blocks.timestamp', '>', epoch.startTime.toISOString())
      .andWhere('blocks.timestamp', '<=', epoch.endTime.toISOString())
      .groupBy('validators.pro_tx_hash')
      .count('* as tx_count')
      .sum('gas_used as collected_fees')
      .select('validators.pro_tx_hash',
        this.knex.raw('ROW_NUMBER() OVER (ORDER BY COUNT(blocks.hash) DESC) as row_num')
      )

    const subqueryWithTotalFees = this.knex
      .select(
        'pro_tx_hash',
        'tx_count',
        'collected_fees',
        'row_num',
        this.knex.raw('SUM(collected_fees) OVER () as total_collected_fees')
      )
      .from(subquery)

    const [row] = await this.knex
      .select(
        this.knex.raw(`SUM(tx_count) OVER () * 1.0 / ${Constants.EPOCH_CHANGE_TIME / 1000} as tps`),
        'pro_tx_hash as best_validator',
        'total_collected_fees as total_collected_fees'
      )
      .groupBy('pro_tx_hash', 'row_num', 'collected_fees', 'total_collected_fees', 'tx_count')
      .orderBy('row_num', 'asc')
      .from(subqueryWithTotalFees)

    return EpochData.fromObject({ epoch, ...row })
  }
}
