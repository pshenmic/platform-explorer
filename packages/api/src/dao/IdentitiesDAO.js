const Identity = require("../models/Identity");
const Transfer = require("../models/Transfer");
const Transaction = require("../models/Transaction");
const Document = require("../models/Document");
const DataContract = require("../models/DataContract");
const PaginatedResultSet = require("../models/PaginatedResultSet");

module.exports = class IdentitiesDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getIdentityByIdentifier = async (identifier) => {
        const subquery = this.knex('identities')
            .select('identities.id', 'identities.identifier as identifier', 'identities.state_transition_hash as tx_hash', 'identities.revision as revision')
            .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
            .where('identities.identifier', '=', identifier)
            .as('all_identities')

        const lastRevisionIdentities = this.knex(subquery)
            .select('identifier', 'revision', 'tx_hash', 'transfers.id as transfer_id', 'transfers.sender as sender', 'transfers.recipient as recipient', 'transfers.amount as amount')
            .where('rank', 1)
            .leftJoin('transfers', 'transfers.recipient', 'identifier')

        const documentsSubQuery = this.knex('documents')
            .select('documents.id', 'documents.state_transition_hash', 'state_transitions.owner as owner')
            .select(this.knex.raw('rank() over (partition by documents.identifier order by documents.id desc) rank'))
            .leftJoin('state_transitions', 'documents.state_transition_hash', 'state_transitions.hash')
            .where('state_transitions.owner', identifier)
            .as('as_documents')

        const dataContractsSubQuery = this.knex('data_contracts')
            .select('data_contracts.id', 'data_contracts.state_transition_hash', 'state_transitions.owner as owner')
            .select(this.knex.raw('rank() over (partition by data_contracts.identifier order by data_contracts.id desc) rank'))
            .leftJoin('state_transitions', 'data_contracts.state_transition_hash', 'state_transitions.hash')
            .where('state_transitions.owner', identifier)
            .as('as_data_contracts')

        const transfersSubquery = this.knex('transfers')
            .select('transfers.id as id', 'transfers.state_transition_hash as tx_hash')
            .leftJoin('state_transitions', 'tx_hash', 'state_transitions.hash')
            .where('state_transitions.owner', identifier)

        const rows = await this.knex.with('with_alias', lastRevisionIdentities)
            .select('identifier', 'revision', 'transfer_id', 'sender', 'tx_hash', 'blocks.timestamp as timestamp', 'recipient', 'amount')
            .join('state_transitions', 'state_transitions.hash', 'tx_hash')
            .join('blocks', 'state_transitions.block_hash', 'blocks.hash')
            .select(this.knex('with_alias').sum('amount').where('recipient', identifier).as('total_received'))
            .select(this.knex('with_alias').sum('amount').where('sender', identifier).as('total_sent'))
            .select(this.knex('state_transitions').count('*').where('owner', identifier).as('total_txs'))
            .select(this.knex(documentsSubQuery).count('*').where('rank', 1).as('total_documents'))
            .select(this.knex(dataContractsSubQuery).count('*').where('rank', 1).as('total_data_contracts'))
            .select(this.knex.with('with_transfers', transfersSubquery).count('*').as('total_transfers'))
            .from('with_alias')
            .limit(1)

        if (!rows.length) {
            return null
        }

        const [row] = rows

        const balance = Number(row.total_received ?? 0) - Number(row.total_sent ?? 0)

        return Identity.fromRow({...row, balance})
    }

    getIdentities = async (page, limit, order) => {
        const fromRank = (page - 1) * limit + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('identities')
            .select('identities.id', 'identities.identifier as identifier',
                'identities.state_transition_hash as tx_hash', 'identities.revision as revision')
            .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
            .as('identities')

        const filteredIdentities = this.knex(subquery)
            .select('identifier', 'tx_hash', 'revision', 'rank')
            .select(this.knex.raw(`rank() over (order by identities.id ${order}) row_number`))
            .where('rank', 1)
            .as('filtered_identities')

        const rows = await this.knex(filteredIdentities)
            .select('identifier', 'revision', 'tx_hash', 'blocks.timestamp as timestamp', 'row_number')
            .select(this.knex('identities').count('*').as('total_count'))
            .join('state_transitions', 'state_transitions.hash', 'tx_hash')
            .join('blocks', 'state_transitions.block_hash', 'blocks.hash')
            .whereBetween('row_number', [fromRank, toRank])
            .orderBy('blocks.height', order)

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        return new PaginatedResultSet(rows.map(row => Identity.fromRow(row)), page, limit, totalCount)
    }

    getDataContractsByIdentity = async (identifier, page, limit, order) => {
        const fromRank = (page - 1) * limit + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('data_contracts')
            .select('data_contracts.id', 'data_contracts.identifier as identifier', 'data_contracts.schema as schema', 'data_contracts.version as version', 'data_contracts.state_transition_hash as tx_hash')
            .select(this.knex.raw(`rank() over (partition by data_contracts.identifier order by data_contracts.id desc) rank`))
            .join('state_transitions', 'state_transitions.hash', 'data_contracts.state_transition_hash',)
            .where('state_transitions.owner', '=', identifier)

        const filteredDataContracts = this.knex.with('with_alias', subquery)
            .select('id', 'identifier', 'schema', 'version', 'tx_hash', 'rank')
            .select(this.knex('with_alias').count('*').where('rank', 1).as('total_count'))
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .from('with_alias')
            .where('rank', 1)
            .as('data_contracts')

        const rows = await this.knex(filteredDataContracts)
            .select('identifier', 'schema', 'version', 'tx_hash', 'rank', 'total_count', 'row_number', 'blocks.timestamp as timestamp')
            .join('state_transitions', 'state_transitions.hash', 'tx_hash')
            .join('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .whereBetween('row_number', [fromRank, toRank])
            .orderBy('blocks.height ', order)

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        return new PaginatedResultSet(rows.map(row => DataContract.fromRow(row)), page, limit, totalCount)
    }

    getDocumentsByIdentity = async (identifier, page, limit, order) => {
        const fromRank = (page - 1) * limit + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('documents')
            .select('documents.id', 'documents.identifier as identifier', 'documents.data as document_data', 'documents.data_contract_id as data_contract_id', 'documents.revision as revision', 'documents.state_transition_hash as tx_hash', 'documents.deleted as deleted')
            .select(this.knex.raw(`rank() over (partition by documents.identifier order by documents.id desc) rank`))
            .join('state_transitions', 'state_transitions.hash', 'documents.state_transition_hash')
            .where('state_transitions.owner', '=', identifier)

        const filteredDocuments = this.knex.with('with_alias', subquery)
            .select('id', 'identifier', 'revision', 'document_data', 'data_contract_id', 'deleted', 'tx_hash', 'rank')
            .select(this.knex('with_alias').count('*').where('rank', 1).as('total_count'))
            .select(this.knex.raw(`rank() over (order by id ${order}) row_number`))
            .from('with_alias')
            .where('rank', 1)
            .as('documents')

        const rows = await this.knex(filteredDocuments)
            .select('documents.identifier as identifier', 'data_contracts.identifier as data_contract_identifier', 'revision', 'document_data', 'deleted', 'tx_hash', 'total_count', 'row_number', 'data_contract_id', 'blocks.timestamp as timestamp')
            .join('state_transitions', 'state_transitions.hash', 'tx_hash')
            .join('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .join('data_contracts', 'data_contracts.id', 'data_contract_id')
            .whereBetween('row_number', [fromRank, toRank])
            .orderBy('blocks.height ', order)

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        return new PaginatedResultSet(rows.map(row => Document.fromRow({
            ...row, data: row.document_data
        })), page, limit, totalCount)
    }

    getTransactionsByIdentity = async (identifier, page, limit, order) => {
        const fromRank = (page - 1) * limit + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('state_transitions')
            .select('state_transitions.hash as tx_hash', 'state_transitions.index as index', 'state_transitions.type as type', 'state_transitions.data as data', 'state_transitions.block_hash as block_hash')
            .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
            .where('state_transitions.owner', '=', identifier)

        const rows = await this.knex.with('with_alias', subquery)
            .select('tx_hash', 'index', 'data', 'block_hash', 'type', 'rank', 'blocks.timestamp as timestamp', 'blocks.height as block_height')
            .select(this.knex('with_alias').count('*').as('total_count'))
            .join('blocks', 'blocks.hash', 'block_hash')
            .from('with_alias')
            .whereBetween('rank', [fromRank, toRank])
            .orderBy('blocks.height', order)

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        return new PaginatedResultSet(rows.map(row => Transaction.fromRow(row)), page, limit, totalCount)
    }

    getTransfersByIdentity = async (identifier, page, limit, order) => {
        const fromRank = (page - 1) * limit + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('transfers')
            .select('transfers.id', 'transfers.amount as amount', 'transfers.sender as sender', 'transfers.recipient as recipient', 'transfers.state_transition_hash as tx_hash')
            .select(this.knex.raw(`rank() over (order by transfers.id ${order}) rank`))
            .where('transfers.sender', '=', identifier)
            .orWhere('transfers.recipient', '=', identifier)

        const rows = await this.knex.with('with_alias', subquery)
            .select('amount', 'sender', 'recipient', 'rank', 'tx_hash', 'blocks.timestamp as timestamp')
            .select(this.knex('with_alias').count('*').as('total_count'))
            .join('state_transitions', 'state_transitions.hash', 'tx_hash')
            .join('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .from('with_alias')
            .whereBetween('rank', [fromRank, toRank])
            .orderBy('blocks.height', order)

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        return new PaginatedResultSet(rows.map(row => Transfer.fromRow(row)), page, limit, totalCount)
    }
}
