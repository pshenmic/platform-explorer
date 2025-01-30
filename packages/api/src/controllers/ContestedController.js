const ContestedDAO = require('../dao/ContestedDAO')
const MasternodeVotesDAO = require('../dao/MasternodeVotesDAO')


class ContestedController {
  constructor(knex, dapi) {
    this.contestedDAO = new ContestedDAO(knex, dapi)
    this.masternodeVotesDAO = new MasternodeVotesDAO(knex, dapi)
  }

  getContestedResource = async (request, response) => {
    const {resource_value: resourceValue} = request.query

    if (!resourceValue || resourceValue?.length === 0) {
      response.status(400).send({message: 'resourceValue must be set and cannot be empty'})
    }

    const resource = await this.contestedDAO.getContestedResource(resourceValue)

    response.send(resource)
  }

  getVotesForResource = async (request, response) => {
    const {resource_value: resourceValue, choice, page = 1, limit = 10, order = 'asc'} = request.query

    if (!resourceValue || resourceValue?.length === 0) {
      response.status(400).send({message: 'resourceValue must be set and cannot be empty'})
    }

    const votes = await this.masternodeVotesDAO.getMasternodeVotes(choice, resourceValue,undefined, undefined, undefined, undefined, undefined, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(votes)
  }
}

module.exports = ContestedController
