class BlockController {
    constructor(knex) {
        this.knex = knex
    }

    getBlockByHash = async (request, response) => {
        const results = await this.knex
            .select('blocks.hash as hash', 'state_transitions.hash as st_hash')
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

        const {hash} = block

        response.send({hash, txs});
    }

    getBlocks = async (request, response) => {
        const {from, to, order = 'desc'} = request.query

        const subquery = this.knex('blocks')
            .select('id', 'block_height', 'hash').as('blocks')
            .where(function () {
                if (from && to) {
                    this.where('block_height', '>=', from)
                    this.where('block_height', '<=', to)
                }
            })
            .limit(30)
            .orderBy('id', order);

        const rows = await this.knex(subquery)
            .select('blocks.hash as hash', 'blocks.block_height as block_height', 'state_transitions.hash as st_hash')
            .leftJoin('state_transitions', 'state_transitions.block_id', 'blocks.id')
            .groupBy('blocks.hash', 'blocks.block_height', 'state_transitions.hash')
            .orderBy('blocks.block_height', 'desc')

        // map-reduce Blocks with Transactions
        const blocksMap = rows.reduce((blocks, row) => {
            const block = blocks[row.hash]
            const {hash, block_height, st_hash} = row
            const txs = block?.txs || []

            if (st_hash) {
                txs.push(st_hash)
            }

            return {...blocks, [row.hash]: {hash, height: block_height, txs}}
        }, {})

        const blocks = Object.keys(blocksMap).map(blockHash => blocksMap[blockHash])

        response.send(blocks);
    }
}

module.exports = BlockController
