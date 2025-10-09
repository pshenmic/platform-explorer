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

  getDataContracts = async (page, limit, order, orderBy, owner, isSystem, withTokens, timestampStart, timestampEnd, documentsCountMin, documentsCountMax) => {
    const fromRank = ((page - 1) * limit)

    let filtersQuery = ''
    const filtersBindings = []

    let timestampsQuery = ''
    const timestampBindings = []

    let documentCountQuery = ''
    const documentCountBindings = []

    const orderByOptions = [{ column: 'filtered_data_contracts.id', order }]

    if (orderBy === 'documents_count') {
      orderByOptions.unshift({ column: 'documents_count', order })
    }

    if (owner) {
      filtersBindings.push(owner)
      filtersQuery = 'owner = ?'
    }

    if (withTokens === true || withTokens === false) {
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and tokens_count >= 1' : 'tokens_count >= 1'
    }

    if (isSystem === true || isSystem === false) {
      filtersBindings.push(isSystem)
      filtersQuery = filtersQuery !== '' ? filtersQuery + ' and is_system = ?' : 'is_system = ?'
    }

    if (documentsCountMin && documentsCountMax) {
      documentCountQuery = 'documents_count between ? and ?'
      documentCountBindings.push(documentsCountMin, documentsCountMax)
    }

    if (timestampStart && timestampEnd) {
      timestampsQuery = 'blocks.timestamp between ? and ?'
      timestampBindings.push(timestampStart, timestampEnd)
    }

    const subquery = this.knex('data_contracts')
      .select(
        'data_contracts.id as id',
        'data_contracts.identifier as identifier',
        'data_contracts.name as name',
        'data_contracts.identifier as my_identifier',
        'data_contracts.owner as owner',
        'data_contracts.is_system as is_system',
        'data_contracts.version as version',
        'data_contracts.state_transition_hash as tx_hash',
        this.knex.raw('COALESCE(document_counts.count, 0) as documents_count'),
        this.knex.raw('COALESCE(tokens_counts.count, 0) as tokens_count')
      )
      .leftJoin(
        this.knex('documents')
          .select('data_contract_id')
          .count('* as count')
          .where('revision', '=', 1)
          .groupBy('data_contract_id')
          .as('document_counts'),
        'document_counts.data_contract_id', '=', 'data_contracts.id'
      )
      .leftJoin(
        this.knex('tokens')
          .select('data_contract_id')
          .count('* as count')
          .groupBy('data_contract_id')
          .as('tokens_counts'),
        'tokens_counts.data_contract_id', '=', 'data_contracts.id'
      )
      .where('version', 1)
      .orWhere('version', 0)

    const filteredContracts = this.knex.with('filtered_data_contracts', subquery)
      .select(
        'filtered_data_contracts.id', 'name', 'filtered_data_contracts.owner',
        'version', 'tx_hash', 'is_system', 'identifier', 'documents_count'
      )
      .select('blocks.timestamp as timestamp', 'blocks.hash as block_hash')
      .andWhereRaw(filtersQuery, filtersBindings)
      .andWhereRaw(timestampsQuery, timestampBindings)
      .andWhereRaw(documentCountQuery, documentCountBindings)
      .leftJoin('state_transitions', 'state_transitions.hash', 'filtered_data_contracts.tx_hash')
      .leftJoin('blocks', 'blocks.height', 'state_transitions.block_height')
      .from('filtered_data_contracts')

    const rows = await this.knex
      .with('filtered_data_contracts', filteredContracts)
      .select(this.knex.raw('COALESCE(documents_count, 0) as documents_count'))
      .select(this.knex('filtered_data_contracts').count('*').as('total_count'))
      .select(
        'filtered_data_contracts.id', 'name',
        'identifier', 'filtered_data_contracts.owner', 'version',
        'filtered_data_contracts.tx_hash', 'is_system', 'timestamp', 'block_hash')
      .orderBy(orderByOptions)
      .limit(limit)
      .offset(fromRank)
      .from('filtered_data_contracts')

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
      .andWhere('version', 0)
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
          .andWhere('version', 0)
          .orderBy('id', order)
          .limit(limit)
          .offset(fromRank)
      ], true)
      .limit(limit)
      .as('union_subquery')

    const rows = await this.knex(unionSubquery)
      .select('identifier', 'transitions_count')
      .select(
        this.knex('data_contracts')
          .where('version', 0)
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
