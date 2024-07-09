const EpochDAO = require('../dao/EpochDAO')
const Constants = require('../constants')

class EpochController {
  epochDAO

  constructor (knex) {
    this.epochDAO = new EpochDAO(knex)
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params

    const epochChangeTime = Constants.EPOCH_CHANGE_TIME
    const genesisTime = await Constants.genesisTime

    if (genesisTime.getTime() + index * epochChangeTime > new Date().getTime()) {
      return response.status(400).send({ message: 'Invalid epoch date' })
    }

    const epochInfo = await this.epochDAO.getEpochByIndex(index)

    response.send(epochInfo)
  }
}

module.exports = EpochController
