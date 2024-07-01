const TransactionsDAO = require('../dao/TransactionsDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const TenderdashRPC = require('../tenderdashRpc')
const { calculateEpoch } = require('../utils')

class EpochController {
  constructor (knex) {
    this.blocksDAO = new BlocksDAO(knex)
    this.transactionsDAO = new TransactionsDAO(knex)
    this.knex = knex
  }

  getEpochInfo = async (request, response) => {
    const { index } = request.params

    const genesis = await TenderdashRPC.getGenesis()
    const [currentBlock] = (await this.blocksDAO.getBlocks(1, 1, 'desc')).resultSet

    const epoch = calculateEpoch({
      index,
      genesis_time: genesis?.genesis_time,
      currentBlock
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
