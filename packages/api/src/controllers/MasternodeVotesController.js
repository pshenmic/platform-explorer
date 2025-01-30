const MasternodeVotesDAO = require('../dao/MasternodeVotesDAO')

class MasternodeVotesController {
  constructor (knex, dapi) {
    this.masternodeVotesDAO = new MasternodeVotesDAO(knex, dapi)
  }

  getMasternodeVotes = async (request, response) => {
    const {
      page = 1, limit = 10,
      order = 'asc', timestamp_start: timestampStart, timestamp_end: timestampEnd,
      voter_identity: voterIdentity, towards_identity: towardsIdentity, choice, power
    } = request.query

    const masternodeVotes = await this.masternodeVotesDAO.getMasternodeVotes(choice, undefined, timestampStart, timestampEnd, voterIdentity, towardsIdentity, power, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(masternodeVotes)
  }
}

module.exports = MasternodeVotesController
