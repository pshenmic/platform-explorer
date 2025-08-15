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
    const { identifier } = request.params
    const {
      page = 1,
      limit = 10,
      order = 'asc'
    } = request.query

    const transitions = await this.tokensDAO.getTokenTransitions(
      identifier,
      Number(page ?? 0),
      Number(limit ?? 0),
      order
    )

    response.send(transitions)
  }

  getTokensTrends = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      timestamp_start: start = new Date().getTime() - 2592000000,
      timestamp_end: end = new Date().getTime()
    } = request.query

    if (!start || !end) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const rating = await this.tokensDAO.getTokensTrends(
      new Date(start),
      new Date(end),
      Number(page ?? 0),
      Number(limit ?? 0),
      order
    )

    response.send(rating)
  }

  getTokensByIdentity = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query
    const { identifier } = request.params

    const tokens = await this.tokensDAO.getTokensByIdentity(identifier, Number(page ?? 0), Number(limit ?? 0), order)

    response.send(tokens)
  }
}

module.exports = TokensController
