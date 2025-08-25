const TransactionsDAO = require('../dao/TransactionsDAO')
const utils = require('../utils')
const { calculateInterval, iso8601duration } = require('../utils')
const Intervals = require('../enums/IntervalsEnum')
const DataContractsDAO = require('../dao/DataContractsDAO')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
const BatchTypeEnum = require('../enums/BatchEnum')

class TransactionsController {
  constructor (knex, sdk) {
    this.transactionsDAO = new TransactionsDAO(knex, sdk)
    this.dataContractsDAO = new DataContractsDAO(knex, sdk)
    this.sdk = sdk
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
      owner,
      page = 1,
      limit = 10,
      order = 'asc',
      orderBy = 'id',
      status = 'ALL',
      gas_min: gasMin,
      gas_max: gasMax,
      transaction_type: transactionTypes,
      batch_type: batchTypes,
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd
    } = request.query

    if (order !== 'asc' && order !== 'desc') {
      return response.status(400).send({ message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values` })
    }

    if (transactionTypes?.length === 0 && transactionTypes) {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    if (batchTypes?.length === 0 && batchTypes) {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    if (!timestampStart !== !timestampEnd) {
      return response.status(400).send({ message: 'you must use timestamp_start and timestamp_end' })
    }

    if (!['gas_used', 'timestamp', 'id', 'owner'].includes(orderBy)) {
      return response.status(400).send({ message: 'invalid ordering field' })
    }

    const transactions = await this.transactionsDAO.getTransactions(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      orderBy,
      transactionTypes?.map(transactionType => typeof transactionType === 'string' ? StateTransitionEnum[transactionType] : transactionType),
      batchTypes?.map(batchType => typeof batchType === 'string' ? BatchTypeEnum[batchType] : batchType),
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
      timestamp_start: timestampStart = new Date().getTime() - 3600000,
      timestamp_end: timestampEnd = new Date().getTime(),
      intervalsCount = null
    } = request.query

    if (!timestampStart || !timestampEnd) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (timestampStart > timestampEnd) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const intervalInMs =
      Math.ceil(
        (new Date(timestampEnd).getTime() - new Date(timestampStart).getTime()) / Number(intervalsCount ?? NaN) / 1000
      ) * 1000

    const interval = intervalsCount
      ? iso8601duration(intervalInMs)
      : calculateInterval(new Date(timestampStart), new Date(timestampEnd))

    const timeSeries = await this.transactionsDAO.getHistorySeries(
      new Date(timestampStart),
      new Date(timestampEnd),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(timeSeries)
  }

  getGasHistory = async (request, response) => {
    const {
      timestamp_start: start = new Date().getTime() - 3600000,
      timestamp_end: end = new Date().getTime(),
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

    const decoded = await utils.decodeStateTransition(base64)

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
