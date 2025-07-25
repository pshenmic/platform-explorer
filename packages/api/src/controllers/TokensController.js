const TokensDAO = require('../dao/TokensDAO')

class TokensController {
  constructor (knex, dapi) {
    this.tokensDAO = new TokensDAO(knex, dapi)
  }

  getTokens = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc'
    } = request.query

    const tokens = await this.tokensDAO.getTokens(Number(page ?? 0), Number(limit ?? 0), order)

    response.send(tokens)
  }

  getTokenByIdentifier = async (request, response) => {
    const {
      identifier
    } = request.params

    const token = await this.tokensDAO.getTokenByIdentifier(identifier)

    if (!token) {
      response.status(404).send({ message: 'not found' })
    }

    response.send(token)
  }

  getTokenTransitions = async (request, response) => {
    const {
      identifier
    } = request.params

    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transitions = await this.tokensDAO.getTokenTransitions(identifier, Number(page ?? 0), Number(limit ?? 0), order)

    response.send(transitions)
  }

  getTokensTrends = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const rating = await this.tokensDAO.getTokensTrends(Number(page ?? 0), Number(limit ?? 0), order)

    response.send(rating)
  }
}

module.exports = TokensController
