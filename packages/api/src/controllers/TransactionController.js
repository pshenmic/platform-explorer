const cache = require("../cache");
const Transaction = require("../models/Transaction");

class TransactionController {
    constructor(client, knex) {
        this.client = client
        this.knex = knex
    }

    getTransactions = async (request, response) => {
        const {from, to} = request.query

        const rows = await this.knex
            .select('state_transitions.hash as hash', 'state_transitions.data as data', 'state_transitions.type as type',
                'state_transitions.index as index', 'blocks.height as block_height', 'blocks.timestamp as timestamp')
            .from('state_transitions')
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')
            .where((builder) => {
                if (from && to) {
                    builder.where('block_height', '<', to);
                    builder.where('block_height', '>', from);
                }
            })
            .limit(30)
            .orderBy('blocks.height', 'desc')

        const transactions = rows.map((row) => Transaction.fromJSON(row))

        response.send(transactions);
    }

    getTransactionByHash = async (request, reply) => {
        const {txHash} = request.params;

        const [row] = await this.knex('state_transitions')
            .select('state_transitions.hash as hash', 'state_transitions.data as data', 'state_transitions.type as type',
                'state_transitions.index as index', 'blocks.height as block_height', 'blocks.timestamp as timestamp')
            .where('state_transitions.hash', txHash)
            .leftJoin('blocks', 'blocks.hash', 'state_transitions.block_hash')

        if (row) {
            return reply.send(Transaction.fromJSON(row))
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
