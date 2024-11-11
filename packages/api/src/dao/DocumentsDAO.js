const Document = require('../models/Document')
const PaginatedResultSet = require('../models/PaginatedResultSet')

module.exports = class DocumentsDAO {
  constructor(knex) {
    this.knex = knex
  }

  getDocumentByIdentifier = async (identifier) => {
    const subquery = this.knex('documents')
      .select('documents.id', 'documents.identifier as identifier', 'documents.owner as document_owner',
        'data_contracts.identifier as data_contract_identifier', 'documents.data as data_contract_data',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash',
        'documents.deleted as deleted', 'documents.is_system as is_system')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .where('documents.identifier', '=', identifier)
      .as('documents')

    const rows = await this.knex(subquery)
      .select('identifier', 'document_owner', 'data_contract_identifier', 'data_contract_data',
        'revision', 'deleted', 'rank', 'tx_hash', 'is_system', 'blocks.timestamp as timestamp')
      .leftJoin('state_transitions', 'state_transitions.hash', 'tx_hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .limit(1)

    const [row] = rows

    if (!row) {
      return null
    }

    return Document.fromRow({
      ...row,
      data: row.data_contract_data,
      owner: row.document_owner
    })
  }

  getDocumentsByDataContract = async (identifier, page, limit, order) => {
    const fromRank = ((page - 1) * limit) + 1
    const toRank = fromRank + limit - 1

    const subquery = this.knex('documents')
      .select('documents.id as id', 'documents.identifier as identifier', 'documents.owner as document_owner',
        'data_contracts.identifier as data_contract_identifier', 'documents.data as document_data',
        'documents.revision as revision', 'documents.state_transition_hash as tx_hash',
        'documents.deleted as deleted', 'documents.is_system as is_system')
      .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .where('data_contracts.identifier', identifier)

    const filteredDocuments = this.knex.with('with_alias', subquery)
      .select('id', 'identifier', 'document_owner', 'rank', 'revision', 'data_contract_identifier',
        'tx_hash', 'deleted', 'is_system', 'document_data',
        this.knex('with_alias').count('*').as('total_count').where('rank', '1'))
      .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
      .from('with_alias')
      .where('rank', '1')
      .as('documents')

    const rows = await this.knex(filteredDocuments)
      .select('documents.id as id', 'identifier', 'document_owner', 'row_number', 'revision', 'data_contract_identifier',
        'tx_hash', 'deleted', 'document_data', 'total_count', 'is_system', 'blocks.timestamp as timestamp')
      .whereBetween('row_number', [fromRank, toRank])
      .leftJoin('state_transitions', 'tx_hash', 'state_transitions.hash')
      .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
      .orderBy('id', order)

    const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0

    const resultSet = rows.map((row) => Document.fromRow({
      ...row,
      owner: row.document_owner,
      data: row.document_data
    }))

    return new PaginatedResultSet(resultSet, page, limit, totalCount)
  }

  getDocumentsCountByDataContract = async (identifier) => {
    const [{count}] = await this.knex('documents')
      .count('*')
      .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
      .where('data_contracts.identifier', identifier)

    return Number(count ?? 0)
  }
}
