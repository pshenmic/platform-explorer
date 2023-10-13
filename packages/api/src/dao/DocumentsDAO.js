const Document = require("../models/Document");
const PaginatedResultSet = require("../models/PaginatedResultSet");

module.exports = class DocumentsDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getDocumentByIdentifier = async (identifier) => {
        const subquery = this.knex('documents')
            .select('documents.id as id', 'documents.identifier as identifier', 'data_contracts.identifier as data_contract_identifier', 'documents.data as data', 'documents.revision as revision', 'documents.state_transition_hash as state_transition_hash', 'documents.deleted as deleted')
            .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
            .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
            .where('documents.identifier', '=', identifier)
            .as('documents')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'data_contract_identifier', 'data', 'revision', 'deleted', 'rank', 'state_transition_hash')
            .limit(1);

        const [row] = rows

        if (!row) {
            return null
        }

        return Document.fromRow(row);
    }

    getDocumentsByDataContract = async (identifier, page, limit, order) => {
        const fromRank = (page - 1) * limit
        const toRank = fromRank + limit - 1

        const subquery = this.knex('documents')
            .select('documents.id as id', 'documents.identifier as identifier',
                'data_contracts.identifier as data_contract_identifier', 'documents.data as data',
                'documents.revision as revision', 'documents.state_transition_hash as state_transition_hash',
                'documents.deleted as deleted')
            .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
            .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
            .where('data_contracts.identifier', identifier)

        const filteredDocuments = this.knex.with('with_alias', subquery)
            .select('id', 'identifier', 'rank', 'revision', 'data_contract_identifier',
                'state_transition_hash', 'deleted', 'data',
                this.knex('with_alias').count('*').as('total_count').where('rank', '1'))
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .from('with_alias')
            .where('rank', '1')
            .orderBy('id', order)
            .as('test')

        const rows = await this.knex(filteredDocuments)
            .select('id', 'identifier', 'row_number', 'revision', 'data_contract_identifier', 'state_transition_hash', 'deleted', 'data', 'total_count')
            .whereBetween('row_number', [fromRank, toRank])
            .orderBy('id', order);

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        const resultSet = rows.map((row) => Document.fromRow(row));

        return new PaginatedResultSet(resultSet, page, limit, totalCount)
    }
}
