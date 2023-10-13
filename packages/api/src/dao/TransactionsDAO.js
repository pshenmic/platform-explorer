const Transaction = require("../models/Transaction");
const PaginatedResultSet = require("../models/PaginatedResultSet");

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

    getTransactions = async (page, limit, order) => {
        const fromRank = (page - 1) * limit
        const toRank = fromRank + limit - 1

        const subquery = this.knex('state_transitions')
            .select(this.knex('state_transitions').count('hash').as('total_count'), 'state_transitions.hash as hash', 'state_transitions.data as data', 'state_transitions.type as type',
                'state_transitions.index as index', 'blocks.height as block_height', 'blocks.timestamp as timestamp')
            .select(this.knex.raw(`rank() over (order by state_transitions.id ${order}) rank`))
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .as('transactions')

        const rows = await this.knex(subquery)
            .select('total_count', 'hash', 'data', 'type', 'index', 'block_height', 'timestamp', 'rank')
            .whereBetween('rank', [fromRank, toRank])
            .orderBy('block_height', order);

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        const resultSet =  rows.map((row) => Transaction.fromRow(row))

        return new PaginatedResultSet(resultSet, page, limit, totalCount)
    }
}
