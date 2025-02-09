const ContestedDAO = require('../dao/ContestedResourcesDAO')

class ContestedResourcesController {
  constructor (knex, dapi) {
    this.contestedResourcesDAO = new ContestedDAO(knex, dapi)
  }

  getContestedResource = async (request, response) => {
    const { resourceValue } = request.params

    if (!resourceValue) {
      response.status(400).send({ message: 'resourceValue must be set and cannot be empty' })
    }

    const decodedResourceValue = JSON.parse(Buffer.from(resourceValue, 'base64'))

    const resource = await this.contestedResourcesDAO.getContestedResource(decodedResourceValue)

    response.send(resource)
  }

  getContestedResourceVotes = async (request, response) => {
    const { choice, page = 1, limit = 10, order = 'asc' } = request.query
    const { resourceValue } = request.params

    if (!resourceValue) {
      response.status(400).send({ message: 'resourceValue must be set and cannot be empty' })
    }

    const decodedResourceValue = JSON.parse(Buffer.from(resourceValue, 'base64'))

    const votes = await this.contestedResourcesDAO.getVotesForContestedResource(Number(choice) ?? null, decodedResourceValue, Number(page ?? 1), Number(limit ?? 10), order)

    if (!votes) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(votes)
  }
}

module.exports = ContestedResourcesController
