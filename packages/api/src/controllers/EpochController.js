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

    try {
      const [currentEpoch, nextEpoch] = await this.dapi.getEpochsInfo(2, index, true)

      const epoch = Epoch.fromObject({ ...currentEpoch, nextEpoch })

      const epochInfo = await this.epochDAO.getEpochByObject(epoch)

      response.send(epochInfo)
    } catch (e) {
      response.status(400).send({ message: 'not found' })
    }
  }
}

module.exports = EpochController
