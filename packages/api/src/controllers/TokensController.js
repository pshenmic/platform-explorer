const TokensDAO = require('../dao/TokensDAO')

class TokensController {
  constructor (knex, sdk) {
    this.tokensDAO = new TokensDAO(knex, sdk)
  }

  getTokens = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc'
    } = request.query

    const tokens = await this.tokensDAO.getTokens(Number(page ?? 1), Number(limit ?? 10), order)

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
      Number(page ?? 1),
      Number(limit ?? 10),
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
      Number(page ?? 1),
      Number(limit ?? 10),
      order
    )

    response.send(rating)
  }

  getTokensByIdentity = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query
    const { identifier } = request.params

    const tokens = await this.tokensDAO.getTokensByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(tokens)
  }

  getTokensByName = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query
    const { name } = request.params

    const tokens = await this.tokensDAO.getTokensByName(name, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(tokens)
  }

  getTokenHolders = async (request, response) => {
    const { identifier } = request.params
    const {
      page = 1,
      limit = 10,
      order = 'asc'
    } = request.query

    const transitions = await this.tokensDAO.getTokenHolders(
      identifier,
      Number(page ?? 1),
      Number(limit ?? 10),
      order
    )

    response.send(transitions)
  }
}

module.exports = TokensController
