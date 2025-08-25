const EpochDAO = require('../dao/EpochDAO')
const BlocksDAO = require('../dao/BlocksDAO')
const Epoch = require('../models/Epoch')

class EpochController {
  epochDAO
  blocksDAO

  constructor (knex, sdk) {
    this.epochDAO = new EpochDAO(knex)
    this.blocksDAO = new BlocksDAO(knex)
    this.sdk = sdk
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params

    try {
      const [currentEpoch, nextEpoch] = await this.dapi.getEpochsInfo(2, index ?? undefined, index ? true : undefined)

      const epoch = Epoch.fromObject(typeof index === 'number' ? { ...currentEpoch, nextEpoch } : { ...nextEpoch })

      const epochInfo = await this.epochDAO.getEpochByObject(epoch)

      response.send(epochInfo)
    } catch (e) {
      console.error(e)

      response.status(400).send({ message: 'not found' })
    }
  }
}

module.exports = EpochController
