const Block = require('../models/Block');
const BlocksDAO = require('../dao/BlocksDAO');

class BlocksController {
    constructor(knex) {
        this.knex = knex
        this.blocksDAO = new BlocksDAO(knex)
    }

    getBlockByHash = async (request, response) => {
        const {hash} = request.params

        const block = await this.blocksDAO.getBlockByHash(hash)

        if (!block) {
            return response.status(404).send({message: 'not found'})
        }

        response.send(block);
    }

    getBlocks = async (request, response) => {
        const {from, to, order = 'desc'} = request.query

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

        const blocks = Object
            .keys(blocksMap).map(blockHash => Block.fromRow({
                header: blocksMap[blockHash], txs: blocksMap[blockHash].txs
            }))

        response.send(blocks);
    }
}

module.exports = BlocksController
