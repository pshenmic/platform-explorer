const EpochDAO = require('../dao/EpochDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Constants = require('../constants')

class EpochController {
  epochDAO
  blocksDAO

  constructor (knex) {
    this.epochDAO = new EpochDAO(knex)
    this.blocksDAO = new BlocksDAO(knex)
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params

    const epochChangeTime = Constants.EPOCH_CHANGE_TIME
    const genesisTime = await Constants.genesisTime

    const [currentBlock] = (await this.blocksDAO.getBlocks(1, 1, 'desc')).resultSet

    if (genesisTime.getTime() + index * epochChangeTime > currentBlock.header.timestamp.getTime()) {
      return response.status(400).send({ message: 'Invalid epoch date' })
    }

    const epochInfo = await this.epochDAO.getEpochByIndex(index, currentBlock)

    response.send(epochInfo)
  }
}

module.exports = EpochController
