const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')
const { calculateInterval, iso8601duration } = require('../utils')
const Intervals = require('../enums/IntervalsEnum')
const StateTransitionEnum = require('../enums/StateTransitionEnum')

class TransactionsController {
  constructor (client, knex, dapi) {
    this.client = client
    this.transactionsDAO = new TransactionsDAO(knex, dapi)
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
      page = 1,
      limit = 10,
      order = 'asc',
      filters = [-1],
      owner,
      status = 'ALL'
    } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    const stateTransitionIndexes = Object.entries(StateTransitionEnum).map(([, entry]) => entry)

    const validatedFilters =
      filters.map((filter) =>
        stateTransitionIndexes.includes(filter) || filter === -1
      )

    if (validatedFilters.includes(false) || filters.length === 0 || typeof filters !== 'object') {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    const transactions = await this.transactionsDAO.getTransactions(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      filters,
      owner,
      status
    )

    response.send(transactions)
  }

  getTransactionHistory = async (request, response) => {
    const {
      start = new Date().getTime() - 3600000,
      end = new Date().getTime(),
      timespan = null,
      intervalsCount = null
    } = request.query

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    let timespanStart = null
    let timespanEnd = null

    const timespanInterval = {
      '1h': { offset: 3600000, step: 'PT5M' },
      '24h': { offset: 86400000, step: 'PT2H' },
      '3d': { offset: 259200000, step: 'PT6H' },
      '1w': { offset: 604800000, step: 'PT14H' }
    }[timespan]

    if (timespanInterval) {
      timespanStart = new Date().getTime() - timespanInterval.offset
      timespanEnd = new Date().getTime()
    }

    const intervalInMs =
      Math.ceil(
        (new Date(timespanEnd ?? end).getTime() - new Date(timespanStart ?? start).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : (timespanInterval?.step ?? calculateInterval(new Date(start), new Date(end)))

    const timeSeries = await this.transactionsDAO.getHistorySeries(
      new Date(timespanStart ?? start),
      new Date(timespanEnd ?? end),
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
}

module.exports = TransactionsController
