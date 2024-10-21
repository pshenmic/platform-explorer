const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')

class TransactionsController {
  constructor (client, knex) {
    this.client = client
    this.transactionsDAO = new TransactionsDAO(knex)
  }

  getTransactionByHash = async (request, reply) => {
    const { hash } = request.params

    const transaction = await this.transactionsDAO.getTransactionByHash(hash)

    if (!transaction) {
      return reply.status(404).send({ message: 'not found' })
    }

    reply.send(transaction)
  }

  getTransactions = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    const transactions = await this.transactionsDAO.getTransactions(Number(page ?? 1), Number(limit ?? 10), order)

    response.send(transactions)
  }

  getTransactionHistory = async (request, response) => {
    const { timespan = '1h' } = request.query

    const timeSeries = await this.transactionsDAO.getHistorySeries(timespan)

    response.send(timeSeries)
  }

  decode = async (request, reply) => {
    const { base64 } = request.body

    const decoded = await utils.decodeStateTransition(this.client, base64)

    reply.send(decoded)
  }
}

module.exports = TransactionsController
