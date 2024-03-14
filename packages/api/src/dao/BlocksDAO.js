const Block = require("../models/Block");
const PaginatedResultSet = require("../models/PaginatedResultSet");

module.exports = class BlockDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getStats = async () => {
        const blocksQuery = this.knex('blocks')
            .select('height', 'timestamp', 'block_version', 'app_version', 'l1_locked_height')
            .select(this.knex.raw('LAG(timestamp, 1) over (order by blocks.height asc) prev_timestamp'))
            .select(this.knex('blocks').max('height').as('max_height'))
            .orderBy('height', 'desc')

        const diffQuery = this.knex.with('with_alias', blocksQuery)
            .select('max_height', 'height', 'timestamp', 'prev_timestamp', 'block_version', 'app_version', 'l1_locked_height')
            .select(this.knex.raw('timestamp - prev_timestamp as diff'))
            .from('with_alias')
            .where(this.knex.raw('height > (max_height - 100)'))
            .as('blocks')

        const averageQuery = this.knex(diffQuery)
            .select('diff', 'height', 'block_version', 'app_version', 'l1_locked_height')
            .select(this.knex.raw('avg(diff) over () average'))
            .as('average_query')

        const final = await this.knex(averageQuery)
            .select('average')
            .select('height', 'block_version', 'app_version', 'l1_locked_height', 'average')
            .select(this.knex.raw('extract (epoch from average) as average_seconds'))
            .select(this.knex('state_transitions').count('*').as('tx_count'))
            .select(this.knex('transfers').count('*').as('transfers_count'))
            .select(this.knex('data_contracts').count('*').as('data_contracts_count'))
            .select(this.knex('documents').count('*').as('documents_count'))

        const [result] = final

        const {
            height,
            block_version,
            app_version,
            l1_locked_height,
            average_seconds,
            tx_count,
            transfers_count,
            data_contracts_count,
            documents_count
        } = result

        return {
            topHeight: height,
            blockTimeAverage: parseFloat(average_seconds),
            blockVersion: parseInt(block_version),
            appVersion: parseInt(app_version),
            l1LockedHeight: parseInt(l1_locked_height),
            txCount: parseInt(tx_count),
            transfersCount: parseInt(transfers_count),
            dataContractsCount: parseInt(data_contracts_count),
            documentsCount: parseInt(documents_count)
        }
    }

    getBlockByHash = async (blockHash) => {
        const results = await this.knex
            .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height')
            .from('blocks')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .where('blocks.hash', blockHash);

        const [block] = results

        if (!block) {
            return null
        }

        const txs = results.reduce((acc, value) => {
            if (value.st_hash) {
                return [...acc, value.st_hash]
            }

            return acc
        }, [])


        return Block.fromRow({header: block, txs});
    }

    getBlockByHeight = async (height) => {
        const results = await this.knex
            .select('blocks.hash as hash', 'state_transitions.hash as st_hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height')
            .from('blocks')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .where('blocks.height', height);

        const [block] = results

        if (!block) {
            return null
        }

        const txs = results.reduce((acc, value) => {
            if (value.st_hash) {
                return [...acc, value.st_hash]
            }

            return acc
        }, [])

        return Block.fromRow({header: block, txs});
    }

    getBlocks = async (page, limit, order) => {
        const fromRank = ((page - 1) * limit) + 1
        const toRank = fromRank + limit - 1

        const subquery = this.knex('blocks')
            .select(this.knex('blocks').count('height').as('total_count'),
                'blocks.hash as hash', 'blocks.height as height', 'blocks.timestamp as timestamp',
                'blocks.block_version as block_version', 'blocks.app_version as app_version',
                'blocks.l1_locked_height as l1_locked_height')
            .select(this.knex.raw(`rank() over (order by blocks.height ${order}) rank`))
            .as('blocks')

        const rows = await this.knex(subquery)
            .select('rank', 'total_count', 'blocks.hash as hash', 'height', 'timestamp', 'block_version',
                'app_version', 'l1_locked_height', 'state_transitions.hash as st_hash')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .whereBetween('rank', [fromRank, toRank])
            .orderBy('blocks.height', order);

        const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

        // map-reduce Blocks with Transactions
        const blocksMap = rows.reduce((blocks, row) => {
            const block = blocks[row.hash]
            const {st_hash} = row
            const txs = block?.txs || []

            if (st_hash) {
                txs.push(st_hash)
            }

            return {...blocks, [row.hash]: {...row, txs}}
        }, {})

        const resultSet = Object.keys(blocksMap).map(blockHash => Block.fromRow({
            header: blocksMap[blockHash], txs: blocksMap[blockHash].txs
        }))

        return new PaginatedResultSet(resultSet, page, limit, totalCount)
    }
}
