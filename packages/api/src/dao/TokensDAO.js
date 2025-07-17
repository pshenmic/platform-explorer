const Token = require('../models/Token')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class TokensDAO {
  constructor (knex, dapi) {
    this.knex = knex
    this.dapi = dapi
  }

  getTokens = async (page, limit, order) => {
    const fromRank = ((page - 1) * limit)

    const subquery = this.knex('tokens')
      .select('localizations', 'tokens.identifier as identifier', 'base_supply', 'max_supply', 'mintable', 'tokens.owner',
        'burnable', 'freezable', 'unfreezable', 'destroyable', 'allowed_emergency_actions',
        'data_contracts.identifier as data_contract_identifier', 'tokens.id'
      )
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('localizations', 'identifier', 'base_supply', 'max_supply', 'mintable', 'owner',
        'burnable', 'freezable', 'unfreezable', 'destroyable', 'allowed_emergency_actions',
        'data_contract_identifier'
      )
      .select(this.knex('tokens').count('*').as('total_count'))
      .offset(fromRank)
      .limit(limit)
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const tokens = await Promise.all(rows.map(async (row) => {
      const { totalSystemAmount } = await this.dapi.getTokenTotalSupply(row.identifier)

      return Token.fromObject({
        ...Token.fromRow(row),
        totalSupply: totalSystemAmount.toString()
      })
    }))

    return new PaginatedResultSet(tokens, page, limit, totalCount)
  }

  getTokenByIdentifier = async (identifier) => {
    const rows = await this.knex('tokens')
      .select(
        'position', 'tokens.identifier',
        'tokens.owner', 'distribution_rules',
        'timestamp', 'data_contracts.identifier as data_contract_identifier',
      )
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transitions_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .where('tokens.identifier', identifier)

    const [row] = rows

    const token = Token.fromRow(row)

    const dataContract = await this.dapi.getDataContract(row.data_contract_identifier)

    const tokenConfig = dataContract.tokens[row.position]

    console.log()
    return Token.fromObject({
      ...token,
      description: tokenConfig.description,
      localizations: tokenConfig.conventions.localizations,
      decimals: tokenConfig.conventions.decimals,
      baseSupply: tokenConfig.baseSupply,
      maxSupply: tokenConfig.maxSupply,
      mintable: tokenConfig.manualMintingRules.authorizedToMakeChange.getTakerType() !== 'NoOne',
      burnable: tokenConfig.manualBurningRules.authorizedToMakeChange.getTakerType() !== 'NoOne',
      freezable: tokenConfig.freezeRules.authorizedToMakeChange.getTakerType() !== 'NoOne',
      changeMaxSupply: tokenConfig.maxSupplyChangeRules.authorizedToMakeChange.getTakerType() !== 'NoOne',
    })
  }
}
