const Document = require('../models/Document');

class DocumentsController {
    constructor(knex) {
        this.knex = knex
    }

    getDocumentByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const subquery = this.knex('documents')
            .select(this.knex.raw('documents.id as id, documents.identifier as identifier, data_contracts.identifier as data_contract_identifier, documents.data as data, documents.revision as revision, documents.state_transition_hash as state_transition_hash, documents.deleted as deleted, rank() over (partition by documents.identifier order by documents.id desc) rank'))
            .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
            .where('documents.identifier', '=', identifier)
            .as('documents')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'data_contract_identifier', 'data', 'revision', 'deleted', 'rank', 'state_transition_hash')
            .limit(1);

        const [row] = rows

        if (!row) {
            response.status(404).send({message: 'not found'})
        }

        response.send(rows.map((row) => (Document.fromRow(row))));
    }

    getDocumentsByDataContract = async (request, response) => {
        const {identifier} = request.params

        const subquery = this.knex('documents')
            .select(this.knex.raw('documents.id as id, documents.identifier as identifier, data_contracts.identifier as data_contract_identifier, documents.data as data, documents.revision as revision, documents.state_transition_hash as state_transition_hash, documents.deleted as deleted, rank() over (partition by documents.identifier order by documents.id desc) rank'))
            .leftJoin('data_contracts', 'data_contracts.id', 'documents.data_contract_id')
            .where('data_contracts.identifier', identifier)
            .as('documents')

        const rows = await this.knex(subquery)
            .select('id', 'identifier', 'data_contract_identifier', 'data', 'revision', 'deleted', 'rank', 'state_transition_hash')
            .orderBy('documents.id', 'asc')

        response.send(rows.map((row) => Document.fromRow(row)));
    }
}

module.exports = DocumentsController
