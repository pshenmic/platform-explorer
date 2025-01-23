const MasternodeVotesDAO = require('../dao/MasternodeVotesDAO')
const PaginatedResultSet = require('../models/PaginatedResultSet')

class MasternodeVotesController {
  constructor (knex) {
    this.masternodeVotesDAO = new MasternodeVotesDAO(knex)
  }

  getMasternodeVotes = async (request, response) => {
    const {
      page = 1, limit = 10,
      order = 'asc', timestamp_start: timestampStart, timestamp_end: timestampEnd,
      voter_identity: voterIdentity, towards_identity: towardsIdentity, choice, power
    } = request.query

    const masternodeVotes = await this.masternodeVotesDAO.getMasternodeVotes(timestampStart, timestampEnd, voterIdentity, towardsIdentity, choice, power, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(masternodeVotes)
  }

  masternodeVoteSearch = async (request, response) => {
    const { query, page = 1, limit = 10, order = 'asc' } = request.query

    if (/^[0-9A-f]{64,64}$/.test(query)) {
      // by tx
      const vote = await this.masternodeVotesDAO.getMasternodeVoteByTx(query)

      if (!vote) {
        return response.status(404).send({ message: 'not found' })
      }

      return response.send(new PaginatedResultSet([vote], 1, 10, 1))
    } else if (/^[0-9A-z]{43,44}$/.test(query)) {
      // by identity
      const votes = await this.masternodeVotesDAO.getMasternodeVotesByIdentity(query, Number(page ?? 1), Number(limit ?? 10), order)

      return response.send(votes)
    } else {
      return response.status(400).send({ message: 'bad query format' })
    }
  }
}

module.exports = MasternodeVotesController
