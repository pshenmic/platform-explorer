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

    const subquery = this.knex('data_contracts')
      .select('data_contracts.id as id', 'data_contracts.identifier as identifier', 'data_contracts.owner as owner',
        'data_contracts.is_system as is_system', 'data_contracts.version as version',
        'data_contracts.state_transition_hash as tx_hash')
      .select(this.knex('documents').count('*').whereRaw('documents.data_contract_id = id').as('documents_count'))
      .select(this.knex.raw('rank() over (partition by identifier order by version desc) rank'))

    const filteredContracts = this.knex.with('filtered_data_contracts', subquery)
      .select('id', 'owner', 'identifier', 'version', 'tx_hash', 'rank', 'is_system', 'documents_count',
        this.knex('filtered_data_contracts').count('*').as('total_count').where('rank', '1'))
      .select(this.knex.raw(`rank() over (${getRankString()}) row_number`))
      .from('filtered_data_contracts')
      .where('rank', 1)
      .as('filtered_data_contracts')

    const rows = await this.knex(filteredContracts)
      .select('filtered_data_contracts.documents_count', 'filtered_data_contracts.id', 'total_count', 'identifier', 'filtered_data_contracts.owner', 'version', 'row_number',
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
    const rows = await this.knex('data_contracts')
      .select('data_contracts.identifier as identifier', 'data_contracts.owner as owner',
        'data_contracts.schema as schema', 'data_contracts.is_system as is_system',
        'data_contracts.version as version', 'state_transitions.hash as tx_hash', 'blocks.timestamp as timestamp')
      .select(this.knex('documents').count('*').whereRaw('documents.data_contract_id = id').as('documents_count'))
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
}
