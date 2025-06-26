const Token = require('../models/Token')

module.exports = class TokensDAO {
  constructor(knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getTokens = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('tokens')
      .select('localizations', 'tokens.identifier as identifier', 'base_supply', 'max_supply', 'mintable', 'tokens.owner',
        'burnable', 'freezable', 'unfreezable', 'destroyable', 'allowed_emergency_actions',
        'data_contracts.identifier as data_contract_identifier', 'tokens.id'
      )
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .select(this.knex.raw(`rank() over (order by tokens.id ${order}) rank`))
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('localizations', 'identifier', 'base_supply', 'max_supply', 'mintable', 'owner',
        'burnable', 'freezable', 'unfreezable', 'destroyable', 'allowed_emergency_actions',
        'data_contract_identifier'
      )
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('id', order)

    return  Promise.all(rows.map(async (row) => {
      const {totalSystemAmount} = await this.dapi.getTokenTotalSupply(row.identifier)

      return Token.fromObject({
        ...Token.fromRow(row),
        totalSupply: totalSystemAmount.toString(),
      })
    }))
  }
}