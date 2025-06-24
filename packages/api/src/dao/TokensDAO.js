module.exports = class TokensDAO {
  constructor(knex) {
    this.knex = knex
  }

  getTokens = async () => {
    return this.knex('tokens')
      .select('localizations', 'base_supply', 'max_supply', 'mintable', 'tokens.owner',
        'burnable', 'freezable', 'unfreezable', 'destroyable', 'allowed_emergency_actions',
        'data_contracts.identifier as data_contract'
      )
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
  }
}