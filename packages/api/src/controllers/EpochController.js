const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const { calculateEpoch } = require('../utils')

class EpochController {
  /* eslint-disable camelcase */
  constructor (knex, genesis_time) {
    this.blocksDAO = new BlocksDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.knex = knex
    this.genesisTime = genesis_time
  }
  /* eslint-disable camelcase */

  getEpochInfo = async (request, response) => {
    const { index } = request.params

    const [currentBlock] = (await this.blocksDAO.getBlocks(1, 1, 'desc')).resultSet

    const epoch = calculateEpoch({
      index,
      genesisTime: this.genesisTime,
      currentBlock: currentBlock.header
    })

    const subquery = this.knex('state_transitions')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')
      .whereRaw(`blocks.timestamp > '${epoch.startTime.toISOString()}' and blocks.timestamp <= '${epoch.endTime.toISOString()}'`)
      .count('* as tx_count')
    const [row] = await this.knex
      .sum('tx_count')
      .from(subquery)

    const tps = Number(row.sum) / 3600

    response.send({
      epoch,
      tps
    })
  }
}

module.exports = EpochController
