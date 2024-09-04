const EpochDAO = require('../dao/EpochDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')

class EpochController {
  epochDAO
  blocksDAO

  constructor (knex, dapi) {
    this.epochDAO = new EpochDAO(knex)
    this.blocksDAO = new BlocksDAO(knex)
    this.dapi = dapi
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params

    const [currentEpoch, nextEpoch] = await this.dapi.getEpochsInfo(index, 200, true)

    if (!currentEpoch) {
      response.status(404).send({ message: 'not found' })
    }

    const epoch = Epoch.fromObject({ ...currentEpoch, nextEpoch })

    const epochInfo = await this.epochDAO.getEpochByObject(epoch)

    response.send(epochInfo)
  }
}

module.exports = EpochController
