const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')
const { calculateInterval } = require('../utils')

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

    const transactions = await this.transactionsDAO.getTransactions(Number(page), Number(limit), order)

    response.send(transactions)
  }

  getTransactionHistory = async (request, response) => {
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime()
    } = request.query

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const interval = calculateInterval(new Date(start), new Date(end))

    const timeSeries = await this.transactionsDAO.getHistorySeries(
      new Date(start),
      new Date(end),
      interval
    )

    response.send(timeSeries)
  }

  decode = async (request, reply) => {
    const { base64 } = request.body

    const decoded = await utils.decodeStateTransition(this.client, base64)

    reply.send(decoded)
  }
}

module.exports = TransactionsController
