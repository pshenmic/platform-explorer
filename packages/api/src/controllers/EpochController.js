const EpochDAO = require('../dao/EpochDAO')

class EpochController {
  epochDAO
  constants

  constructor (knex, constants) {
    this.epochDAO = new EpochDAO(knex, constants)
    this.constants = constants
  }

  getEpochByIndex = async (request, response) => {
    const { index } = request.params

    if (this.constants.genesisTime.getTime() + index * this.constants.EPOCH_CHANGE_TIME > new Date().getTime()) {
      response.status(400).send({ message: 'Invalid epoch date' })
    }

    const epochInfo = await this.epochDAO.getEpochByIndex(index)

    response.send(epochInfo)
  }
}

module.exports = EpochController
