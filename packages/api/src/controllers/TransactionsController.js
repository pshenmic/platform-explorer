const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')
const { calculateInterval, validateAliases } = require('../utils')

class TransactionsController {
  constructor (client, knex, dapi) {
    this.client = client
    this.transactionsDAO = new TransactionsDAO(knex)
    this.dapi = dapi
  }

  getTransactionByHash = async (request, reply) => {
    const { hash } = request.params

    const transaction = await this.transactionsDAO.getTransactionByHash(hash)

    if (!transaction) {
      return reply.status(404).send({ message: 'not found' })
    }

    const validatedAliases = transaction.owner.aliases?.length > 0
      ? await validateAliases(transaction.owner.aliases ?? [], transaction.owner?.identifier, this.dapi)
      : []

    reply.send({
      ...transaction,
      owner: {
        ...transaction.owner,
        aliases: validatedAliases
      }
    })
  }

  getTransactions = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc' } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    const transactions = await this.transactionsDAO.getTransactions(Number(page ?? 1), Number(limit ?? 10), order)

    const transactionsWithCorrectAliases = await Promise.all(transactions.resultSet.map(async transaction =>
      ({
        ...transaction,
        owner: {
          ...transaction.owner,
          aliases: transaction.owner.aliases?.length > 0
            ? await validateAliases(transaction.owner.aliases ?? [], transaction.owner?.identifier, this.dapi)
            : []
        }
      })
    ))

    response.send({ ...transactions, resultSet: transactionsWithCorrectAliases })
  }

  getTransactionHistory = async (request, response) => {
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime(),
      timespan = null
    } = request.query

    if (timespan) {
      const possibleValues = ['1h', '24h', '3d', '1w']

      if (possibleValues.indexOf(timespan) === -1) {
        return response.status(400)
          .send({ message: `invalid timespan value ${timespan}. only one of '${possibleValues}' is valid` })
      }
    }

    let timespanStart = null
    let timespanEnd = null

    const timespanInterval = {
      '1h': { offset: 3600000, step: 'PT5M' },
      '24h': { offset: 86400000, step: 'PT2H' },
      '3d': { offset: 259200000, step: 'PT6H' },
      '1w': { offset: 604800000, step: 'PT14H' }
    }[timespan]

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    if (timespanInterval) {
      timespanStart = new Date().getTime() - timespanInterval.offset
      timespanEnd = new Date().getTime()
    }

    const interval = timespanInterval?.step ?? calculateInterval(new Date(start), new Date(end))

    const timeSeries = await this.transactionsDAO.getHistorySeries(
      new Date(timespanStart ?? start),
      new Date(timespanEnd ?? end),
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
