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
}

module.exports = TokensController
