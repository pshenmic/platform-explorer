const EpochDAO = require('../dao/EpochDAO')

class EpochController {
  constructor (knex, genesisTime) {
    this.epochDAO = new EpochDAO(knex, genesisTime)
  }

  getEpochInfo = async (request, response) => {
    const { index } = request.params

    const epochInfo = await this.epochDAO.getEpochInfo(index)

    if (!epochInfo) {
      response.status(400).send({ message: 'Invalid epoch date' })
    }

    response.send(epochInfo)
  }
}

module.exports = EpochController
