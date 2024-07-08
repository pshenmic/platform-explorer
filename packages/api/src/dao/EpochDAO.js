const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const { calculateEpoch } = require('../utils')

module.exports = class EpochDAO {
  constructor (knex, genesisTime) {
    this.blocksDAO = new BlocksDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.knex = knex
    this.genesisTime = genesisTime
  }

  getEpochInfo = async (index) => {
    const [currentBlock] = (await this.blocksDAO.getBlocks(1, 1, 'desc')).resultSet

    const epoch = calculateEpoch({
      index,
      genesisTime: this.genesisTime,
      timestamp: currentBlock.header.timestamp
    })

    if (!(epoch.startTime instanceof Date && !isNaN(epoch.startTime))) {
      return null
    }

    if (!(epoch.endTime instanceof Date && !isNaN(epoch.endTime))) {
      return null
    }

    const subquery = this.knex('state_transitions')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .whereRaw(`blocks.timestamp > '${epoch.startTime.toISOString()}' and blocks.timestamp <= '${epoch.endTime.toISOString()}'`)
      .count('* as tx_count')
    const [row] = await this.knex
      .select(this.knex.raw('SUM(tx_count) * 1.0 / 3600 as tps'))
      .from(subquery)

    return {
      epoch,
      tps: Number(row.tps)
    }
  }
}
