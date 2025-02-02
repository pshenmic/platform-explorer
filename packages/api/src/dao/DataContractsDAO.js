const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { decodeStateTransition, getAliasInfo, getAliasStateByVote } = require('../utils')

module.exports = class DataContractsDAO {
  constructor (knex, client, dapi) {
    this.knex = knex
    this.client = client
    this.dapi = dapi
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
      .select('documents.id', 'data_contracts.identifier as dc_identifier', 'documents.data_contract_id')
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
      // .as('documents_txs')

    const dataContractsTransactionsSubquery = this.knex('data_contracts')
      .select('state_transition_hash')
      .where('identifier', '=', identifier)
      // .as('data_contracts_txs')

    const unionTransactionsSubquery = this.knex
      .union([documentsTransactionsSubquery, dataContractsTransactionsSubquery])
      .as('transactions_sub')

    const gasSubquery = this.knex(unionTransactionsSubquery)
      .select(this.knex.raw('sum(gas_used) as total_gas_used'))
      .select(this.knex.raw('count(*) as total_count'))
      .leftJoin('state_transitions', 'hash', 'state_transition_hash')

    const rows = await this.knex('data_contracts')
      .with('gas_sub', gasSubquery)
      .select('data_contracts.identifier as identifier', 'data_contracts.name as name', 'data_contracts.owner as owner',
        'data_contracts.schema as schema', 'data_contracts.is_system as is_system',
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

    const [row] = rows

    if (!row) {
      return null
    }

    return DataContract.fromRow(row)
  }

  getDataContractTransactions = async (identifier, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const aliasesSubquery = this.knex('identity_aliases')
      .select('identity_identifier', this.knex.raw('array_agg(alias) as aliases'))
      .groupBy('identity_identifier')
      .as('aliases')

    const dataContractsSubquery = this.knex('data_contracts')
      .select('state_transition_hash')
      .where('data_contracts.identifier', '=', identifier)

    const documentsSubquery = this.knex('documents')
      .select('documents.state_transition_hash as state_transition_hash')
      .where('data_contracts.identifier', '=', identifier)
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')

    const unionSubquery = this.knex.unionAll([dataContractsSubquery, documentsSubquery])
      .as('sub')

    const additionalDataSubquery = this.knex(unionSubquery)
      .select('timestamp', 'sub.state_transition_hash as state_transition_hash', 'owner', 'gas_used', 'data', 'error', 'aliases')
      .select(this.knex.raw('rank() over (order by timestamp asc) as rank'))
      .leftJoin('state_transitions', 'sub.state_transition_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .leftJoin(aliasesSubquery, 'owner', 'aliases.identity_identifier')
      .as('additional_subquery')

    const rows = await this.knex(additionalDataSubquery)
      .select('timestamp', 'state_transition_hash', 'owner', 'gas_used', 'data', 'error', 'aliases')
      .whereBetween('rank', [fromRank, toRank])
      .orderBy('rank', order)

    if (rows.length === 0) {
      return null
    }

    const resultSet = await Promise.all(rows.map(async (row) => {
      const decodedTx = await decodeStateTransition(this.client, row.data)

      const aliases = await Promise.all((row.aliases ?? []).map(async alias => {
        const aliasInfo = await getAliasInfo(alias, this.dapi)

        return getAliasStateByVote(aliasInfo, { alias }, row.owner)
      }))

      return {
        type: decodedTx.type,
        action: decodedTx.transitions?.map(transition => ({
          action: transition.action,
          id: transition.id
        })) ?? null,
        owner: row.owner,
        aliases,
        timestamp: row.timestamp,
        gasUsed: row.gas_used,
        error: row.error,
        hash: row.state_transition_hash
      }
    }))

    return resultSet
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
}
