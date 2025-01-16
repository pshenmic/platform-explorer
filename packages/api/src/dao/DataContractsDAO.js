const DataContract = require('../models/DataContract')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class DataContractsDAO {
  constructor (knex) {
    this.knex = knex
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

  getDataContractsWithContestedDocuments = async (page, limit, order, orderBy) => {
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
      .select('documents.id as id', 'data_contracts.identifier as dc_identifier', 'documents.data_contract_id as data_contract_id', 'prefunded_voting_balance')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .as('sum_documents')

    const documentsSubquery = this.knex(sumDocuments)
      .select('id', 'dc_identifier', 'data_contract_id')
      .whereRaw('prefunded_voting_balance is not null')
      .as('documents_subquery')

    const dataContractsSubQuery = this.knex(documentsSubquery)
      .select('data_contract_id as id')
      .groupBy('data_contract_id')
      .as('data_contract_subquery')

    const subquery = this.knex(dataContractsSubQuery)
      .select('data_contracts.id as id', 'data_contracts.identifier as identifier', 'data_contracts.name as name',
        'data_contracts.identifier as my_identifier', 'data_contracts.owner as owner',
        'data_contracts.is_system as is_system', 'data_contracts.version as version',
        'data_contracts.state_transition_hash as tx_hash')
      .select(this.knex(documentsSubquery)
        .count('*')
        .whereRaw('data_contracts.identifier = documents_subquery.dc_identifier')
        .as('contested_documents_count'))
      .select(this.knex(sumDocuments)
        .count('*')
        .whereRaw('data_contracts.identifier = sum_documents.dc_identifier')
        .as('documents_count'))
      .select(this.knex.raw('rank() over (partition by identifier order by version desc) rank'))
      .leftJoin('data_contracts', 'data_contracts.id', 'data_contract_subquery.id')
      .as('filtered_data_contracts')

    const filteredContracts = this.knex(subquery)
      .select(this.knex.raw('COALESCE(documents_count, 0) as documents_count'))
      .select(this.knex.raw('COALESCE(contested_documents_count, 0) as contested_documents_count'))
      .select('id', 'name', 'owner', 'identifier', 'version', 'tx_hash', 'rank', 'is_system',
        this.knex(subquery).count('*').as('total_count').where('rank', '1'))
      .select(this.knex.raw(`rank() over (${getRankString()}) row_number`))
      .where('rank', 1)
      .as('filtered_data_contracts')

    const rows = await this.knex(filteredContracts)
      .select('filtered_data_contracts.documents_count', 'contested_documents_count', 'filtered_data_contracts.id', 'name', 'total_count', 'identifier', 'filtered_data_contracts.owner', 'version', 'row_number',
        'filtered_data_contracts.tx_hash', 'is_system', 'blocks.timestamp as timestamp', 'blocks.hash as block_hash')
      .leftJoin('state_transitions', 'state_transitions.hash', 'filtered_data_contracts.tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .whereBetween('row_number', [fromRank, toRank])
      .orderBy(orderByOptions)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map(dataContract =>
      ({
        ...DataContract.fromRow(dataContract),
        contestedDocumentsCount: Number(dataContract.contested_documents_count) ?? null
      }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getDataContractByIdentifier = async (identifier) => {
    const rows = await this.knex('data_contracts')
      .select('data_contracts.identifier as identifier', 'data_contracts.name as name', 'data_contracts.owner as owner',
        'data_contracts.schema as schema', 'data_contracts.is_system as is_system',
        'data_contracts.version as version', 'state_transitions.hash as tx_hash', 'blocks.timestamp as timestamp')
      .select(this.knex('documents').count('*')
        .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
        .whereRaw('data_contracts.identifier = ? and revision = ?', [identifier, 1])
        .as('documents_count'))
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
