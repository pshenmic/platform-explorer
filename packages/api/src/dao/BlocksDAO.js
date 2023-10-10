const Block = require("../models/Block");

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

        if (!block.length) {
            return null
        }

        return Block.fromRow({header: block, txs});
    }

    getBlocksPaginated = async (from, to, order = 'desc') => {
        const subquery = this.knex('blocks')
            .select('blocks.hash as hash', 'blocks.height as height', 'blocks.timestamp as timestamp', 'blocks.block_version as block_version', 'blocks.app_version as app_version', 'blocks.l1_locked_height as l1_locked_height').as('blocks')
            .where(function () {
                if (from && to) {
                    this.where('height', '>=', from)
                    this.where('height', '<=', to)
                }
            })
            .limit(30)
            .orderBy('blocks.height', order);

        const rows = await this.knex(subquery)
            .select('blocks.hash as hash', 'height', 'timestamp', 'block_version', 'app_version', 'l1_locked_height', 'state_transitions.hash as st_hash')
            .leftJoin('state_transitions', 'state_transitions.block_hash', 'blocks.hash')
            .groupBy('blocks.hash', 'height', 'blocks.timestamp', 'block_version', 'app_version', 'l1_locked_height', 'state_transitions.hash')
            .orderBy('height', 'desc')

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

        return Object.keys(blocksMap).map(blockHash => Block.fromRow({
                header: blocksMap[blockHash], txs: blocksMap[blockHash].txs
            }))
    }
}
