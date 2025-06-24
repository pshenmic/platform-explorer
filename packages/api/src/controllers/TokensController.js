const TokensDAO = require("../dao/TokensDAO");

class TokensController {
  constructor(knex) {
    this.tokensDAO = new TokensDAO(knex)
  }

  getTokens = async (req, res) => {
    const tokens = await this.tokensDAO.getTokens();

    res.send(tokens)
  }
}

module.exports = TokensController
