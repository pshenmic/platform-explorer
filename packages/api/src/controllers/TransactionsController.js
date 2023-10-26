const cache = require("../cache");
const TransactionsDAO = require("../dao/TransactionsDAO");

class TransactionsController {
    constructor(client, knex) {
        this.client = client
        this.transactionsDAO = new TransactionsDAO(knex)
    }

    getTransactions = async (request, response) => {
        const {page = 1, limit = 10, order = 'asc'} = request.query

        if (order !== 'asc' && order !== 'desc') {
            return response.status(400).send({message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values`})
        }

        const transactions = await this.transactionsDAO.getTransactions(Number(page), Number(limit), order)

        response.send(transactions);
    }

    getTransactionByHash = async (request, reply) => {
        const {txHash} = request.params;

        const transaction = await this.transactionsDAO.getTransactionByHash(txHash)

        if (!transaction) {
            return reply.status(404).send({message: 'not found'})
        }

        reply.send(transaction)
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

module.exports = TransactionsController
