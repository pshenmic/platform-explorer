const Block = require("../models/Block");
const PaginatedResultSet = require("../models/PaginatedResultSet");

module.exports = class BlockDAO {
    constructor(knex) {
        this.knex = knex;
    }

    getMaxHeight = async () => {
        const [result] = await this.knex('blocks').max('height')

        const {max} = result

        return max
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
        const fromRank = (page - 1) * limit
        const toRank = fromRank + limit - 1

        const subquery = this.knex('blocks')
            .select(this.knex('blocks').count('height').as('total_count'), 'blocks.hash as hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height').as('blocks')
            .select(this.knex.raw(`rank() over (order by blocks.height ${order}) rank`))

        const rows = await this.knex(subquery)
            .select('rank', 'total_count', 'blocks.hash as hash', 'height', 'timestamp', 'block_version', 'app_version', 'l1_locked_height', 'state_transitions.hash as st_hash')
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
