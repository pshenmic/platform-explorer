const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')
const { calculateInterval, iso8601duration } = require('../utils')
const Intervals = require('../enums/IntervalsEnum')
const DataContractsDAO = require('../dao/DataContractsDAO')

class TransactionsController {
  constructor (client, knex, dapi) {
    this.client = client
    this.transactionsDAO = new TransactionsDAO(knex, dapi)
    this.dataContractsDAO = new DataContractsDAO(knex, client, dapi)
    this.dapi = dapi
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
    const {
      page = 1, limit = 10,
      order = 'asc', owner,
      status = 'ALL',
      // eslint-disable-next-line camelcase
      gas_min, gas_max, transaction_type
    } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    // eslint-disable-next-line camelcase
    if (transaction_type?.length === 0 && transaction_type) {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    const transactions = await this.transactionsDAO.getTransactions(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      transaction_type,
      owner,
      status,
      gas_min,
      gas_max
    )

    response.send(transactions)
  }

  getTransactionHistory = async (request, response) => {
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime(),
      intervalsCount = null
    } = request.query

    if (!start || !end) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const intervalInMs =
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : calculateInterval(new Date(start), new Date(end))

    const timeSeries = await this.transactionsDAO.getHistorySeries(
      new Date(start),
      new Date(end),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(timeSeries)
  }

  getGasHistory = async (request, response) => {
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime(),
      intervalsCount = null
    } = request.query

    if (!start || !end) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const intervalInMs =
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : calculateInterval(new Date(start), new Date(end))

    const timeSeries = await this.transactionsDAO.getGasHistorySeries(
      new Date(start),
      new Date(end),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(timeSeries)
  }

  decode = async (request, reply) => {
    const { base64 } = request.body

    const decoded = await utils.decodeStateTransition(this.client, base64)

    reply.send(decoded)
  }

  broadcastTransaction = async (request, response) => {
    const { base64 } = request.body

    try {
      await this.dapi.broadcastTransition(Buffer.from(base64, 'hex').toString('base64'))
    } catch (e) {
      return response.status(400).send({ error: e.toString() })
    }

    response.send({ message: 'broadcasted' })
  }
}

module.exports = TransactionsController
