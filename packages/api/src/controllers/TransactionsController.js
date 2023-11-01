const TransactionsDAO = require("../dao/TransactionsDAO");
const utils = require("../utils");

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

        const decoded = await utils.decodeStateTransition(this.client, base64)

        reply.send(decoded)
    }
}

module.exports = TransactionsController
