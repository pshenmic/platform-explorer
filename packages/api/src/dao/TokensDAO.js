const Token = require('../models/Token')
const TokenTransition = require('../models/TokenTransition')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const TokenTransitionsEnum = require('../enums/TokenTransitionsEnum')

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
      .orderBy('id', order)
      .offset(fromRank)
      .limit(limit)

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
    const gasUsedSubquery = this.knex('token_transitions')
      .select(
        this.knex.raw('sum(gas_used) as total_gas_used'),
        this.knex.raw('count(*) as total_transitions_count'),
        this.knex.raw(`count(*) FILTER(WHERE action = '${TokenTransitionsEnum.Freeze}') as total_freeze_transitions_count`),
        this.knex.raw(`count(*) FILTER(WHERE action = '${TokenTransitionsEnum.Burn}') as total_burn_transitions_count`)
      )
      .where('token_identifier', identifier)
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')

    const rows = await this.knex('tokens')
      .select(
        'position', 'tokens.identifier', 'total_gas_used',
        'tokens.owner', 'distribution_rules', 'total_transitions_count',
        'timestamp', 'data_contracts.identifier as data_contract_identifier',
        'total_freeze_transitions_count', 'total_burn_transitions_count'
      )
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .joinRaw('CROSS JOIN (?) as gas_and_counts', [gasUsedSubquery])
      .where('tokens.identifier', identifier)

    const [row] = rows

    const token = Token.fromRow(row)

    const dataContract = await this.dapi.getDataContract(row.data_contract_identifier)
    const tokenTotalSupply = await this.dapi.getTokenTotalSupply(row.identifier)

    const tokenConfig = dataContract.tokens[row.position]

    return Token.fromObject({
      ...token,
      totalSupply: tokenTotalSupply?.totalSystemAmount.toString(),
      description: tokenConfig?.description,
      localizations: tokenConfig?.conventions?.localizations,
      decimals: tokenConfig?.conventions?.decimals,
      baseSupply: tokenConfig?.baseSupply.toString(),
      maxSupply: tokenConfig?.maxSupply?.toString(),
      mintable: tokenConfig?.manualMintingRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      burnable: tokenConfig?.manualBurningRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      freezable: tokenConfig?.freezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      changeMaxSupply: tokenConfig?.maxSupplyChangeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      unfreezable: tokenConfig?.unfreezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      destroyable: tokenConfig?.destroyFrozenFundsRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      allowedEmergencyActions: tokenConfig?.emergencyActionRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
      distributionType: tokenConfig?.distributionRules?.perpetualDistribution?.distributionType?.getDistribution()?.constructor?.name?.slice(0, -4) ?? null,
      mainGroup: tokenConfig?.mainControlGroup
    })
  }

  getTokenTransitions = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const rows = await this.knex('token_transitions')
      .select(
        'action', 'amount', 'state_transition_hash',
        'recipient', 'timestamp', 'public_note', 'token_transitions.owner'
      )
      .where('token_identifier', identifier)
      .offset(fromRank)
      .limit(limit)
      .orderBy('token_transitions.id', order)
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')

    return new PaginatedResultSet(rows.map(TokenTransition.fromRow), page, limit, order)
  }

  getTokensTrends = async (page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('token_transitions')
      .select('token_identifier')
      .select(this.knex.raw('count(token_identifier) as transitions_count'))
      .groupBy('token_identifier')
      .orderBy('transitions_count', order)
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('token_identifier', 'transitions_count')
      .select(this.knex.raw('count(*) OVER() as total_count'))
      .limit(limit)
      .offset(fromRank)

    const [row] = rows

    const resultSet = rows.map(row => ({
      tokenIdentifier: row.token_identifier ?? null,
      transitionCount: Number(row.transitions_count ?? null)
    }))

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count ?? 0))
  }

  getTokensByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('tokens')
      .select('tokens.identifier as token_identifier', 'position', 'data_contract_id', 'id')
      .select(this.knex.raw('count(*) OVER() as total_count'))
      .where('tokens.owner', identifier)
      .orderBy('id', order)
      .limit(limit)
      .offset(fromRank)
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('data_contracts.identifier as data_contract_identifier', 'total_count', 'subquery.id')
      .select(this.knex.raw(`
        array_agg(
          json_build_object(
            'token_identifier', token_identifier, 
            'position', position
          )
        ) as tokens
      `))
      .groupBy('data_contracts.identifier', 'total_count', 'subquery.id')
      .orderBy('id', order)
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')

    const dataContractsTokens = await Promise.all(rows.map(async (row) => {
      const dataContract = await this.dapi.getDataContract(row.data_contract_identifier)

      if (!dataContract) {
        return undefined
      }

      const tokensPositions = Object.keys(dataContract.tokens)

      return Promise.all(tokensPositions.map(async (tokenPosition) => {
        const tokenIdentifier = row.tokens.find(token => token.position === Number(tokenPosition))?.token_identifier

        if (!tokenIdentifier) {
          return undefined
        }

        const tokenConfig = dataContract.tokens[tokenPosition]

        const tokenTotalSupply = await this.dapi.getTokenTotalSupply(tokenIdentifier)

        return Token.fromObject({
          identifier: tokenIdentifier,
          dataContractIdentifier: row.data_contract_identifier,
          owner: identifier,
          position: Number(tokenPosition),
          totalSupply: tokenTotalSupply?.totalSystemAmount.toString(),
          description: tokenConfig?.description,
          localizations: tokenConfig?.conventions?.localizations,
          decimals: tokenConfig?.conventions?.decimals,
          baseSupply: tokenConfig?.baseSupply.toString(),
          maxSupply: tokenConfig?.maxSupply?.toString(),
          mintable: tokenConfig?.manualMintingRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          burnable: tokenConfig?.manualBurningRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          freezable: tokenConfig?.freezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          changeMaxSupply: tokenConfig?.maxSupplyChangeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          unfreezable: tokenConfig?.unfreezeRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          destroyable: tokenConfig?.destroyFrozenFundsRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          allowedEmergencyActions: tokenConfig?.emergencyActionRules?.authorizedToMakeChange.getTakerType() !== 'NoOne',
          distributionType: tokenConfig?.distributionRules?.perpetualDistribution?.distributionType?.getDistribution()?.constructor?.name?.slice(0, -4) ?? null,
          mainGroup: tokenConfig?.mainControlGroup
        })
      }))
    }))

    const tokens = dataContractsTokens
      .reduce((acc, contract) => contract ? [...acc, ...contract.filter((token) => token !== undefined)] : acc, [])

    const [row] = rows

    return new PaginatedResultSet(tokens, page, limit, Number(row?.total_count ?? 0))
  }
}
