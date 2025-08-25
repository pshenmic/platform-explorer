const Token = require('../models/Token')
const TokenTransition = require('../models/TokenTransition')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const TokenTransitionsEnum = require('../enums/TokenTransitionsEnum')
const Localization = require('../models/Localization')
const PerpetualDistribution = require('../models/PerpetualDistribution')
const PreProgrammedDistribution = require('../models/PreProgrammedDistribution')
const { decodeStateTransition } = require('../utils')
const BatchEnum = require('../enums/BatchEnum')
const { getAliasFromDocument } = require('../utils')
const { DPNS_CONTRACT } = require('../constants')

module.exports = class TokensDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
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
      const { totalSystemAmount } = await this.sdk.tokens.getTokenTotalSupply(row.identifier)

      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Token.fromObject({
        ...Token.fromRow({
          ...row,
          owner: {
            identifier: row.owner?.trim(),
            aliases: aliases ?? []
          }
        }),
        totalSupply: totalSystemAmount.toString()
      })
    }))

    return new PaginatedResultSet(tokens, page, limit, totalCount)
  }

  getTokenByIdentifier = async (identifier) => {
    const priceSubquery = this.knex('token_transitions')
      .select('data', 'action', 'status', 'token_identifier')
      .where('action', TokenTransitionsEnum.SetPriceForDirectPurchase)
      .andWhere('token_identifier', identifier)
      .andWhere('status', 'SUCCESS')
      .orderBy('token_transitions.id', 'desc')
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .limit(1)
      .as('price_subquery')

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
      .with('gas_used_subquery', gasUsedSubquery)
      .select(
        'position', 'tokens.identifier', 'total_gas_used',
        'tokens.owner', 'distribution_rules', 'total_transitions_count',
        'timestamp', 'data_contracts.identifier as data_contract_identifier',
        'total_freeze_transitions_count', 'total_burn_transitions_count',
        'price_subquery.data as price_transition_data'
      )
      .leftJoin('state_transitions', 'state_transitions.hash', 'state_transition_hash')
      .leftJoin('blocks', 'block_hash', 'blocks.hash')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .leftJoin(priceSubquery, 'price_subquery.token_identifier', 'tokens.identifier')
      .joinRaw('CROSS JOIN gas_used_subquery as gas_and_counts')
      .where('tokens.identifier', identifier)

    const [row] = rows

    if (!row) {
      return undefined
    }

    const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

    const aliases = []

    if (aliasDocument) {
      aliases.push(getAliasFromDocument(aliasDocument))
    }

    const token = Token.fromRow({
      ...row,
      owner: {
        identifier: row.owner?.trim(),
        aliases: aliases ?? []
      }
    })

    let priceTx = null

    if (row.price_transition_data) {
      const decodedTx = await decodeStateTransition(row.price_transition_data)

      priceTx = decodedTx.transitions[0]
    }

    const dataContract = await this.sdk.dataContracts.getDataContractByIdentifier(row.data_contract_identifier)
    const tokenTotalSupply = await this.sdk.tokens.getTokenTotalSupply(row.identifier)

    const tokenConfig = dataContract.tokens[row.position]

    const { perpetualDistribution, preProgrammedDistribution } = tokenConfig?.distributionRules ?? {}

    const preProgrammedDistributions = preProgrammedDistribution?.distributions

    const preProgrammedDistributionTimestamps = preProgrammedDistributions ? Object.keys(preProgrammedDistributions) : undefined

    const preProgrammedDistributionNormal = preProgrammedDistributionTimestamps?.map((timestamp) => PreProgrammedDistribution.fromWASMObject({ timestamp, value: preProgrammedDistributions[timestamp] }))

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
      mainGroup: tokenConfig?.mainControlGroup,
      perpetualDistribution: perpetualDistribution ? PerpetualDistribution.fromWASMObject(perpetualDistribution) : null,
      preProgrammedDistribution: preProgrammedDistributionNormal,
      price: priceTx?.price,
      prices: priceTx?.prices
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

    const resultSet = await Promise.all(rows.map(async (row) => {
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return TokenTransition.fromRow({
        ...row,
        action: BatchEnum[row.action + 6],
        owner: {
          identifier: row.owner?.trim(),
          aliases: aliases ?? []
        }
      })
    }))

    return new PaginatedResultSet(resultSet, page, limit, order)
  }

  getTokensTrends = async (startDate, endDate, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('token_transitions')
      .select('token_identifier')
      .select(this.knex.raw('count(token_identifier) as transitions_count'))
      .whereBetween('timestamp', [startDate.toISOString(), endDate.toISOString()])
      .groupBy('token_identifier')
      .leftJoin('state_transitions', 'state_transitions.hash', 'token_transitions.state_transition_hash')
      .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')

    const countedSubquery = this.knex
      .with('subquery', subquery)
      .select('token_identifier', 'transitions_count')
      .select(this.knex.raw('0 as id'))
      .orderBy('transitions_count', order)
      .limit(limit)
      .offset(fromRank)
      .from('subquery')

    const unionQuery = this.knex
      .with('counted_subquery', countedSubquery)
      .unionAll([
        this.knex.select('*').from('counted_subquery'),
        this.knex('tokens')
          .select('identifier as token_identifier')
          .select(this.knex.raw("'0'::int as transitions_count"))
          .select('id')
          .whereNotIn('identifier', function () {
            this.select('token_identifier').from('counted_subquery')
          })
          .whereNotExists(this.knex.select('*').from('counted_subquery'))
          .orderBy('id', order)
          .limit(limit)
          .offset(fromRank)
      ], true)
      .as('subquery')

    const rows = await this.knex(unionQuery)
      .select('token_identifier', 'transitions_count', 'data_contracts.identifier as data_contract_identifier', 'tokens.position')
      .orderBy('transitions_count', order)
      .orderBy('subquery.id', order)
      .select(this.knex('tokens').select(this.knex.raw('count(*) OVER() as total_count')).limit(1).as('total_count'))
      .leftJoin('tokens', 'tokens.identifier', 'token_identifier')
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')

    const resultSet = await Promise.all(rows.map(async (row) => {
      const dataContract = await this.sdk.dataContracts.getDataContractByIdentifier(row.data_contract_identifier)

      const token = dataContract.tokens[row.position]

      const localizations = {}

      for (const locale in token.conventions.localizations) {
        localizations[locale] = Localization.fromObject(token.conventions.localizations[locale])
      }

      return {
        localizations,
        tokenIdentifier: row.token_identifier ?? null,
        transitionCount: Number(row.transitions_count ?? null)
      }
    }))

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count ?? 0))
  }

  getTokensByIdentity = async (identifier, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('token_holders')
      .select('position', 'data_contract_id', 'token_id', 'identifier as token_identifier')
      .select(this.knex.raw('count(*) OVER() as total_count'))
      .where('holder', identifier)
      .leftJoin('tokens', 'tokens.id', 'token_holders.token_id')
      .orderBy('token_id', order)
      .limit(limit)
      .offset(fromRank)
      .as('subquery')

    const rows = await this.knex(subquery)
      .select('data_contracts.identifier as data_contract_identifier', 'total_count')
      .select(this.knex.raw(`
        array_agg(
          json_build_object(
            'token_identifier', token_identifier, 
            'position', position
          )
        ) as tokens
      `))
      .groupBy('data_contracts.identifier', 'total_count', 'token_id')
      .orderBy('token_id', order)
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')

    if (rows.length === 0) {
      return new PaginatedResultSet([], page, limit, 0)
    }

    const dataContractsTokens = await Promise.all(rows.map(async (row) => {
      const dataContract = await this.sdk.dataContracts.getDataContractByIdentifier(row.data_contract_identifier)

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

        const tokenTotalSupply = await this.sdk.tokens.getTokenTotalSupply(tokenIdentifier)

        const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', identifier.trim()]], 1)

        const aliases = []

        if (aliasDocument) {
          aliases.push(getAliasFromDocument(aliasDocument))
        }

        const { perpetualDistribution, preProgrammedDistribution } = tokenConfig?.distributionRules ?? {}

        const preProgrammedDistributions = preProgrammedDistribution?.distributions

        const preProgrammedDistributionTimestamps = preProgrammedDistributions ? Object.keys(preProgrammedDistributions) : undefined

        const preProgrammedDistributionNormal = preProgrammedDistributionTimestamps?.map((timestamp) => PreProgrammedDistribution.fromWASMObject({ timestamp, value: preProgrammedDistributions[timestamp] }))

        return Token.fromObject({
          identifier: tokenIdentifier,
          dataContractIdentifier: row.data_contract_identifier,
          owner: {
            identifier,
            aliases: aliases ?? []
          },
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
          mainGroup: tokenConfig?.mainControlGroup,
          perpetualDistribution: perpetualDistribution ? PerpetualDistribution.fromWASMObject(perpetualDistribution) : null,
          preProgrammedDistribution: preProgrammedDistributionNormal
        })
      }))
    }))

    const tokens = dataContractsTokens
      .reduce((acc, contract) => contract ? [...acc, ...contract.filter((token) => token !== undefined)] : acc, [])

    const tokenIdentifierList = tokens.map((token) => token.identifier.base58())

    const tokenBalances = await this.sdk.tokens.getIdentityTokensBalances(identifier, tokenIdentifierList)

    const tokensWithBalance = tokens.map(token => ({
      ...token,
      balance: tokenBalances?.find(t => t.identifier === token.identifier)?.balance ?? null
    }))

    const [row] = rows

    return new PaginatedResultSet(tokensWithBalance, page, limit, Number(row?.total_count ?? 0))
  }
}
