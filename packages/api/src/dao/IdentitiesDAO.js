const Identity = require("../models/Identity");

module.exports = class IdentitiesDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getIdentityByIdentifier = async (identifier) => {
        const subquery = this.knex('identities')
            .select('identities.id','identities.identifier as identifier', 'identities.state_transition_hash as st_hash',
                'identities.revision as revision', 'identities.state_transition_hash as state_transition_hash')
            .select(this.knex.raw('rank() over (partition by identities.identifier order by identities.id desc) rank'))
            .where('identities.identifier', '=', identifier)
            .as('all_identities')

        const lastRevisionIdentities = this.knex(subquery)
            .select('identifier', 'revision', 'st_hash',
                'transfers.id as transfer_id', 'transfers.sender as sender',
                'transfers.recipient as recipient', 'transfers.amount as amount')
            .where('rank', 1)
            .leftJoin('transfers', 'transfers.recipient', 'identifier')


        const documentSubQuery = this.knex('documents')
            .select('documents.id as id', 'documents.state_transition_hash as st_hash')
            .join('state_transitions', 'st_hash', 'state_transitions.hash')
            .where('state_transitions.owner', identifier)

        const dataContractsSubQuery = this.knex('data_contracts')
            .select('data_contracts.id as id', 'data_contracts.state_transition_hash as st_hash')
            .join('state_transitions', 'st_hash', 'state_transitions.hash')
            .where('state_transitions.owner', identifier)

        const rows = await this.knex.with('with_alias', lastRevisionIdentities)
            .select('identifier', 'revision',
                'transfer_id', 'sender', 'st_hash', 'blocks.timestamp as timestamp',
                'recipient', 'amount')
            .join('state_transitions', 'state_transitions.hash', 'st_hash')
            .join('blocks', 'state_transitions.block_hash', 'blocks.hash')
            .select(this.knex('with_alias').sum('amount').where('recipient', identifier).as('total_received'))
            .select(this.knex('with_alias').sum('amount').where('sender', identifier).as('total_sent'))
            .select(this.knex('state_transitions').count('*').where('owner', identifier).as('total_txs'))
            .select(this.knex.with('with_documents', documentSubQuery).count('*').where('owner', identifier).as('total_documents'))
            .select(this.knex.with('with_data_contracts', dataContractsSubQuery).count('*').where('owner', identifier).as('total_data_contracts'))
            .from('with_alias')

        if (!rows.length) {
            return null
        }

        const [row] = rows

        const balance = Number(row.total_received ?? 0) - Number(row.total_sent ?? 0)

        return Identity.fromRow({...row, balance})
    }
}
