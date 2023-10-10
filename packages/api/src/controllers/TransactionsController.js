const cache = require("../cache");
const Transaction = require("../models/Transaction");
const TransactionsDAO = require("../dao/TransactionsDAO");

class TransactionsController {
    constructor(client, knex) {
        this.client = client
        this.transactionsDAO = new TransactionsDAO(knex)
    }

    getTransactions = async (request, response) => {
        const {from, to} = request.query

        const transactions = await this.transactionsDAO.getTransactions(from, to)

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
