const cache = require("../cache");
const {hash} = require("../utils")
const TenderdashRPC = require("../tenderdashRpc");

class TransactionController {
    constructor(client, knex) {
        this.client = client
        this.knex = knex
    }

    getTransactions = async (request, response) => {
        const {from, to} = request.query

        const rows = await this.knex.select(
            'blocks.id as block_id', 'blocks.block_height as block_height', 'state_transitions.hash as hash',
            'state_transitions.type as type'
        )
            .from('state_transitions')
            .leftJoin('blocks', 'blocks.id', 'state_transitions.block_id')
            .where( (builder) => {
                if (from && to) {
                    builder.where('block_height', '<', to);
                    builder.where('block_height', '>', from);
                }
            })
            .limit(30)
            .orderBy('blocks.id', 'desc')

        const transactions = rows.map(({hash, block_height, type}) =>({hash, blockHeight: block_height, type}))

        response.send(transactions);
    }

    getTransactionByHash = async (request, reply) => {
        const {txHash} = request.params;

        const [row] = await this.knex('state_transitions')
            .select('state_transitions.hash as hash', 'state_transitions.data as data', 'state_transitions.index as index', 'blocks.block_height as block_height',)
            .where('state_transitions.hash', txHash)
            .leftJoin('blocks', 'blocks.id', 'state_transitions.block_id')

        if (row) {
            const {hash, data, block_height, index } = row

            return reply.send({hash, data, blockHeight: block_height, index})
        }

        reply.status(404).send({message: 'not found'})
    }

    decode = async (request, reply) => {
        const {base64} = request.body;

        const cached = cache.get('decoded_' + base64)

        if (cached) {
            return reply.send(cached)
        }

        const stateTransition = await this.client.platform.dpp.stateTransition.createFromBuffer(Buffer.from(base64, 'base64'));

        cache.set('decoded_' + base64, stateTransition)

        reply.send(stateTransition)
    }
}

module.exports = TransactionController
