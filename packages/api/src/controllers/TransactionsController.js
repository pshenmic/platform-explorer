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
      gas_min: gasMin, gas_max: gasMax,
      transaction_type: transactionType,
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd
    } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    if (transactionType?.length === 0 && transactionType) {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    if (!timestampStart !== !timestampEnd) {
      return response.status(400).send({ message: 'you must use timestamp_start and timestamp_end' })
    }

    const transactions = await this.transactionsDAO.getTransactions(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      transactionType,
      owner,
      status,
      gasMin,
      gasMax,
      timestampStart,
      timestampEnd
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
    const { base64, hex } = request.body

    if (!base64 && !hex) {
      return response.status(400).send('hex or base64 must be set')
    }

    const transactionBuffer = hex
      ? Buffer.from(hex, 'hex')
      : Buffer.from(base64, 'base64')

    try {
      await this.dapi.broadcastTransition(transactionBuffer.toString('base64'))
    } catch (e) {
      return response.status(400).send({ error: e.toString() })
    }

    response.send({ message: 'broadcasted' })
  }
}

module.exports = TransactionsController
