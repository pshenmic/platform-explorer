const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { decodeStateTransition, getAliasFromDocument } = require('../utils')
const Token = require('../models/Token')
const { TokenConfigurationWASM, IdentifierWASM } = require('pshenmic-dpp')
const { DPNS_CONTRACT } = require('../constants')

module.exports = class DataContractsDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getDataContracts = async (page, limit, order, orderBy) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const orderByOptions = [{ column: 'filtered_data_contracts.id', order }]

    if (orderBy === 'documents_count') {
      orderByOptions.unshift({ column: 'documents_count', order })
    }

    const getRankString = () => {
      return orderByOptions.reduce((acc, value, index, arr) =>
        acc + ` ${value.column} ${value.order}${index === arr.length - 1 ? '' : ','}`, 'order by')
    }

    const sumDocuments = this.knex('documents')
      .select('documents.id', 'data_contracts.identifier as dc_identifier', 'documents.data_contract_id', 'revision')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .as('sum_documents')

    const subquery = this.knex('data_contracts')
      .select('data_contracts.id as id', 'data_contracts.identifier as identifier', 'data_contracts.name as name',
        'data_contracts.identifier as my_identifier', 'data_contracts.owner as owner',
        'data_contracts.is_system as is_system', 'data_contracts.version as version',
        'data_contracts.state_transition_hash as tx_hash')
      .select(this.knex(sumDocuments)
        .count('*')
        .whereRaw('data_contracts.identifier = sum_documents.dc_identifier')
        .andWhere('revision', '=', '1')
        .as('documents_count'))
      .select(this.knex.raw('rank() over (partition by identifier order by version desc) rank'))

    const filteredContracts = this.knex.with('filtered_data_contracts', subquery)
      .select(this.knex.raw('COALESCE(documents_count, 0) as documents_count'))
      .select('id', 'name', 'owner', 'identifier', 'version', 'tx_hash', 'rank', 'is_system',
        this.knex('filtered_data_contracts').count('*').as('total_count').where('rank', '1'))
      .select(this.knex.raw(`rank() over (${getRankString()}) row_number`))
      .from('filtered_data_contracts')
      .where('rank', 1)
      .as('filtered_data_contracts')

    const rows = await this.knex(filteredContracts)
      .select('filtered_data_contracts.documents_count', 'filtered_data_contracts.id', 'name', 'total_count', 'identifier', 'filtered_data_contracts.owner', 'version', 'row_number',
        'filtered_data_contracts.tx_hash', 'is_system', 'blocks.timestamp as timestamp', 'blocks.hash as block_hash')
      .leftJoin('state_transitions', 'state_transitions.hash', 'filtered_data_contracts.tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy(orderByOptions)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map(dataContract => DataContract.fromRow(dataContract))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getDataContractByIdentifier = async (identifier) => {
    const identitiesSubquery = this.knex('documents')
      .select(this.knex.raw('COUNT(*) OVER(PARTITION BY documents.owner) as documents_count'))
      .select('documents.owner as identity')
      .where('revision', '!=', 0)
      .andWhere('data_contracts.identifier', '=', identifier)
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .as('top_identity')

    const groupedIdentities = this.knex(identitiesSubquery)
      .select('top_identity.identity')
      .groupBy('identity')
      .as('groped_subquery')

    const documentsTransactionsSubquery = this.knex('documents')
      .select('documents.state_transition_hash as state_transition_hash')
      .where('data_contracts.identifier', '=', identifier)
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')

    const dataContractsTransactionsSubquery = this.knex('data_contracts')
      .select('state_transition_hash')
      .where('identifier', '=', identifier)

    const unionTransactionsSubquery = this.knex
      .union([documentsTransactionsSubquery, dataContractsTransactionsSubquery])
      .as('transactions_sub')

    const gasSubquery = this.knex(unionTransactionsSubquery)
      .select(this.knex.raw('sum(gas_used) as total_gas_used'))
      .select(this.knex.raw('count(*) as total_count'))
      .leftJoin('state_transitions', 'hash', 'state_transition_hash')

    const dataSubquery = this.knex('data_contracts')
      .with('gas_sub', gasSubquery)
      .select('data_contracts.identifier as identifier', 'data_contracts.name as name', 'data_contracts.owner as owner',
        'data_contracts.schema as schema', 'data_contracts.is_system as is_system', 'state_transitions.data as state_transition_data',
        'data_contracts.version as version', 'state_transitions.hash as tx_hash', 'blocks.timestamp as timestamp')
      .select(this.knex('documents').count('*')
        .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
        .whereRaw('data_contracts.identifier = ? and revision = ?', [identifier, 1])
        .as('documents_count'))
      .select(this.knex(identitiesSubquery).select('identity').orderBy('documents_count', 'desc').limit(1).as('top_identity'))
      .select(this.knex(groupedIdentities).select(this.knex.raw('count(*)')).limit(1).as('identities_interacted'))
      .select(this.knex('gas_sub').select('total_gas_used').as('total_gas_used'))
      .select(this.knex('gas_sub').select(this.knex.raw('round(total_gas_used/total_count,0)')).as('average_gas_used'))
      .leftJoin('state_transitions', 'data_contracts.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .where('data_contracts.identifier', identifier)
      .orderBy('data_contracts.id', 'desc')
      .limit(1)
      .as('data_sub')

    const rows = await this.knex(dataSubquery)
      .select('identifier', 'owner', 'name', 'schema', 'is_system', 'version', 'tx_hash', 'timestamp', 'state_transition_data',
        'documents_count', 'top_identity', 'identities_interacted', 'total_gas_used', 'average_gas_used')

    const [row] = rows

    if (!row) {
      return null
    }

    const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

    const ownerAliases = []

    if (aliasDocument) {
      ownerAliases.push(getAliasFromDocument(aliasDocument))
    }

    let topIdentityAliases = []

    if (row.owner === row.top_identity || !row.top_identity) {
      topIdentityAliases = ownerAliases
    } else if (row.top_identity) {
      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.top_identity.trim()]], 1)

      if (aliasDocument) {
        topIdentityAliases.push(getAliasFromDocument(aliasDocument))
      }
    }

    const dataContract = DataContract.fromRow({
      ...row,
      owner: {
        identifier: row.owner?.trim() ?? null,
        aliases: ownerAliases
      },
      top_identity: {
        identifier: row.top_identity?.trim() ?? null,
        aliases: topIdentityAliases
      }
    })

    let groups = null
    let tokens = null

    try {
      const config = await this.sdk.dataContracts.getDataContractByIdentifier(identifier)

      groups = (config ?? { groups: undefined }).groups

      const tokenPositions = Object.keys(config?.tokens ?? {})

      tokens = await Promise.all(tokenPositions.map(async (tokenPosition) => {
        const tokenConfig = config.tokens[tokenPosition]

        const tokenIdentifier = TokenConfigurationWASM.calculateTokenId(new IdentifierWASM(identifier), Number(tokenPosition))

        const tokenTotalSupply = await this.sdk.tokens.getTokenTotalSupply(tokenIdentifier.base58())

        return Token.fromObject({
          identifier: tokenIdentifier.base58(),
          dataContractIdentifier: identifier,
          owner: dataContract.owner,
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
    } catch (error) {
      console.error(error)
    }

    return DataContract.fromObject({
      ...dataContract,
      groups,
      tokens
    })
  }

  getDataContractTransactions = async (identifier, page, limit, order) => {
    const fromRank = ((page - 1) * limit)

    const transactionsSubquery = this.knex('data_contract_transitions')
      .select('data_contract_id', 'data_contract_identifier', 'state_transition_id')
      .select(this.knex.raw('count(*) over () as total_count'))
      .where('data_contract_identifier', identifier)
      .whereRaw('state_transition_id is not null')
      .as('transactions_subquery')

    const rows = await this.knex(transactionsSubquery)
      .select(
        'state_transitions.hash as state_transition_hash', 'state_transitions.data', 'total_count', 'block_height',
        'owner', 'gas_used', 'data', 'error', 'state_transitions.id as id', 'timestamp', 'blocks.hash as block_hash'
      )
      .leftJoin('state_transitions', 'transactions_subquery.state_transition_id', 'state_transitions.id')
      .leftJoin('blocks', 'blocks.height', 'state_transitions.block_height')
      .orderBy('state_transition_id', order)
      .offset(fromRank)
      .limit(limit)

    const resultSet = await Promise.all(rows.map(async (row) => {
      let decodedTx

      if (row.data) {
        decodedTx = await decodeStateTransition(row.data)
      }

      const [aliasDocument] = await this.sdk.documents.query(DPNS_CONTRACT, 'domain', [['records.identity', '=', row.owner.trim()]], 1)

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return {
        type: decodedTx?.typeString ?? null,
        action: decodedTx?.transitions?.map(transition => ({
          action: transition.action ?? null,
          documentIdentifier: transition.id ?? null,
          tokenIdentifier: transition.tokenId ?? null,
          recipient: (transition.recipient ?? transition.frozenIdentityId) ?? null,
          price: (transition.price ?? transition.totalAgreedPrice) ?? null,
          amount: (transition.amount ?? transition.burnAmount ?? transition.tokenCount) ?? null
        })) ?? null,
        owner: {
          identifier: row.owner?.trim() ?? null,
          aliases: aliases ?? []
        },
        timestamp: row.timestamp,
        gasUsed: Number(row.gas_used ?? 0),
        error: row.error,
        hash: row.state_transition_hash
      }
    }))

    return new PaginatedResultSet(resultSet, page, limit, Number(rows[0]?.total_count ?? -1))
  }

  getDataContractByName = async (name) => {
    const rows = await this.knex('data_contracts')
      .select(
        'data_contracts.identifier as identifier', 'data_contracts.name as name',
        'data_contracts.owner as owner', 'data_contracts.is_system as is_system',
        'data_contracts.version as version', 'data_contracts.schema as schema',
        'data_contracts.state_transition_hash as tx_hash', 'blocks.timestamp as timestamp'
      )
      .select(
        this.knex('documents')
          .count('*')
          .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
          .whereILike('data_contracts.name', `${name}%`)
          .as('documents_count')
      )
      .whereILike('data_contracts.name', `${name}%`)
      .leftJoin('state_transitions', 'state_transitions.hash', 'data_contracts.state_transition_hash')
      .leftJoin('blocks', 'state_transitions.block_hash', 'blocks.hash')

    if (rows.length === 0) {
      return null
    }

    return rows.map(row => DataContract.fromRow(row))
  }

  getContractsTrends = async (startDate, endDate, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const subquery = this.knex('data_contracts')
      .select('data_contract_id')
      .select(this.knex.raw('count(data_contract_id) as transitions_count'))
      .whereBetween('timestamp', [startDate.toISOString(), endDate.toISOString()])
      .andWhere('version', 1)
      .leftJoin('data_contract_transitions', 'data_contracts.id', 'data_contract_id')
      .leftJoin('state_transitions', 'data_contract_transitions.state_transition_id', 'state_transitions.id')
      .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')
      .groupBy('data_contract_id')

    const countedSubquery = this.knex
      .with('counted_subquery', subquery)
      .select('transitions_count', 'identifier', 'data_contract_id')
      .orderBy('transitions_count', order)
      .limit(limit)
      .offset(fromRank)
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_id')
      .from('counted_subquery')

    const unionSubquery = this.knex
      .with('counted_subquery', countedSubquery)
      .unionAll([
        this.knex.select('*').from('counted_subquery'),
        this.knex('data_contracts')
          .select(this.knex.raw("'0'::int as transitions_count"))
          .select('identifier', 'id as data_contract_id')
          .whereNotIn('id', function () {
            this.select('data_contract_id').from('counted_subquery')
          })
          .whereNotExists(this.knex.select('*').from('counted_subquery'))
          .andWhere('version', 1)
          .orderBy('id', order)
          .limit(limit)
          .offset(fromRank)
      ], true)
      .as('union_subquery')

    const rows = await this.knex(unionSubquery)
      .select('identifier', 'transitions_count')
      .select(
        this.knex('data_contracts')
          .where('version', 1)
          .count('*')
          .limit(1)
          .as('total_count')
      )
      .orderBy('transitions_count', order)

    const resultSet = rows.map(row => ({
      identifier: row.identifier,
      transitionsCount: Number(row.transitions_count ?? 0)
    }))

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count ?? 0))
  }
}
