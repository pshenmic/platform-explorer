const EpochDAO = require('../dao/EpochDAO')
const BlocksDAO = require('../dao/BlocksDAO')

class EpochController {
  epochDAO
  blocksDAO
  dapi

  constructor (knex, dapi) {
    this.epochDAO = new EpochDAO(knex)
    this.blocksDAO = new BlocksDAO(knex)
    this.dapi = dapi
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params
    //
    // const epochChangeTime = Constants.EPOCH_CHANGE_TIME
    // const genesisTime = await Constants.genesisTime
    //
    // const [currentBlock] = (await this.blocksDAO.getBlocks(1, 1, 'desc')).resultSet
    //
    // if (genesisTime.getTime() + index * epochChangeTime > currentBlock.header.timestamp.getTime()) {
    //   return response.status(400).send({ message: 'Invalid epoch date' })
    // }
    //
    // const epochInfo = await this.epochDAO.getEpochByIndex(index, currentBlock)

    const bb = await this.dapi.getEpochsInfo()
    response.send(bb)
  }
}

module.exports = EpochController
