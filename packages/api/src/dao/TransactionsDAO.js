const Transaction = require("../models/Transaction");

module.exports = class TransactionsDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getTransactionByHash = async (hash) => {
        const [row] = await this.knex('state_transitions')
            .select('state_transitions.hash as hash', 'state_transitions.data as data', 'state_transitions.type as type',
                'state_transitions.index as index', 'blocks.height as block_height', 'blocks.timestamp as timestamp')
            .where('state_transitions.hash', hash)
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')

        if (!row) {
            return null
        }

        return Transaction.fromRow(row)
    }

}
