const Block = require("../models/block");
const BlockHeader = require("../models/BlockHeader");

class BlockController {
    constructor(knex) {
        this.knex = knex
    }

    getBlockByHash = async (request, response) => {
        const results = await this.knex
            .select('blocks.id', 'blocks.hash as hash', 'state_transitions.hash as st_hash',
                'blocks.block_height as height', 'blocks.timestamp as timestamp',
                'blocks.block_version as block_version', 'blocks.app_version as app_version',
                'blocks.l1_locked_height as l1_locked_height', 'blocks.chain as chain')
            .from('blocks')
            .leftJoin('state_transitions', 'state_transitions.block_id', 'blocks.id')
            .where('blocks.hash', request.params.hash);

        const [block] = results

        if (!block) {
            return response.status(400).send()
        }

        const txs = results.reduce((acc, value) => {
            if (value.st_hash) {
                return [...acc, value.st_hash]
            }

            return acc
        }, [])

        response.send(Block.fromJSON({header: block, txs}));
    }

    getBlocks = async (request, response) => {
        const {from, to, order = 'desc'} = request.query

        const subquery = this.knex('blocks')
            .select('blocks.id', 'blocks.hash as hash',
                'blocks.block_height as height', 'blocks.timestamp as timestamp',
                'blocks.block_version as block_version', 'blocks.app_version as app_version',
                'blocks.l1_locked_height as l1_locked_height', 'blocks.chain as chain').as('blocks')
            .where(function () {
                if (from && to) {
                    this.where('block_height', '>=', from)
                    this.where('block_height', '<=', to)
                }
            })
            .limit(30)
            .orderBy('id', order);

        const rows = await this.knex(subquery)
            .select('blocks.hash as hash',
                'height', 'timestamp',
                'block_version', 'app_version',
                'l1_locked_height', 'chain', 'state_transitions.hash as st_hash')
            .leftJoin('state_transitions', 'state_transitions.block_id', 'blocks.id')
            .groupBy('blocks.hash', 'height', 'blocks.timestamp', 'block_version', 'app_version',
                'l1_locked_height', 'chain', 'state_transitions.hash')
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

        const blocks = Object
            .keys(blocksMap).map(blockHash => Block.fromJSON({header: blocksMap[blockHash], txs: blocksMap[blockHash].txs}))

        response.send(blocks);
    }
}

module.exports = BlockController
