const IdentitiesDAO = require('../dao/IdentitiesDAO')
const { WITHDRAWAL_CONTRACT_TYPE, WITHDRAWAL_CONTRACT } = require('../constants')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { outputScriptToAddress, iso8601duration, calculateInterval } = require('../utils')
const { IdentifierWASM } = require('pshenmic-dpp')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
const Intervals = require('../enums/IntervalsEnum')
const WithdrawalStatusEnum = require('../enums/WithdrawalStatusEnum')

class IdentitiesController {
  constructor (knex, sdk) {
    this.identitiesDAO = new IdentitiesDAO(knex, sdk)
    this.sdk = sdk
  }

  getIdentityByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(identity)
  }

  getIdentityByDPNSName = async (request, response) => {
    const { dpns } = request.query

    const identity = await this.identitiesDAO.getIdentitiesByDPNSName(dpns)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(identity)
  }

  getIdentities = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      order_by: orderBy = 'block_height',
      tx_count_min: txCountMin,
      tx_count_max: txCountMax,
      documents_count_min: documentsCountMin,
      documents_count_max: documentsCountMax,
      data_contracts_min: dataContractsMin,
      data_contracts_max: dataContractsMax,
      balance_min: balanceMin,
      balance_max: balanceMax
    } = request.query

    if (txCountMin > txCountMax) {
      return response.status(400).send('Bad tx count range')
    }

    if (documentsCountMin > documentsCountMax) {
      return response.status(400).send('Bad document count range')
    }

    if (dataContractsMin > dataContractsMax) {
      return response.status(400).send('Bad document count range')
    }

    if (balanceMin > balanceMax) {
      return response.status(400).send('Bad balance range')
    }

    const identities = await this.identitiesDAO.getIdentities(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      orderBy,
      txCountMin,
      txCountMax,
      documentsCountMin,
      documentsCountMax,
      dataContractsMin,
      dataContractsMax,
      balanceMin,
      balanceMax
    )

    response.send(identities)
  }

  getTransactionsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transactions = await this.identitiesDAO.getTransactionsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(transactions)
  }

  getDataContractsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const dataContracts = await this.identitiesDAO.getDataContractsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(dataContracts)
  }

  getDocumentsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', document_type_name: documentTypeName } = request.query

    const documents = await this.identitiesDAO.getDocumentsByIdentity(identifier, documentTypeName, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getTransfersByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', type, hash } = request.query

    const transfers = await this.identitiesDAO.getTransfersByIdentity(
      identifier,
      hash,
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      typeof type === 'string' ? StateTransitionEnum[type] : type
    )

    response.send(transfers)
  }

  getWithdrawalsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { order = 'asc' } = request.query

    // In Future maybe we don't need this.
    // at this moment used only for page size while requesting batches
    const pageSize = 100
    // 10000 documents
    const maxPages = 100

    const query = [['$ownerId', '=', new IdentifierWASM(identifier).base58()]]

    const documents = []
    let startAfter

    let currentPage = 0

    do {
      const batch = await this.sdk.documents.query(
        WITHDRAWAL_CONTRACT,
        WITHDRAWAL_CONTRACT_TYPE,
        query,
        [['$ownerId', 'asc'], ['status', 'asc'], ['$createdAt', 'asc']],
        pageSize,
        undefined,
        startAfter
      )

      documents.push(...batch)

      if (batch.length < pageSize) break

      startAfter = batch[batch.length - 1].id
      currentPage += 1
    } while (currentPage <= maxPages)

    if (documents.length === 0) {
      return response.send(new PaginatedResultSet([], null, null, null))
    }

    const timestamps = documents.map(document => new Date(Number(document.createdAt)).toISOString())

    const withdrawals = await this.identitiesDAO.getIdentityWithdrawalsByTimestamps(identifier, timestamps)

    const resultSet = documents.map(document => ({
      document: document.id.base58(),
      sender: document.ownerId.base58(),
      status: WithdrawalStatusEnum[document.properties.status],
      timestamp: new Date(Number(document.createdAt)),
      amount: document.properties.amount,
      withdrawalAddress: outputScriptToAddress(Buffer.from(document.properties.outputScript ?? [], 'base64')),
      hash: withdrawals.find(
        withdrawal =>
          withdrawal.timestamp.getTime() === Number(document.createdAt)
      )?.hash
    }))
      .sort((a, b) => {
        const direction = order === 'asc' ? 1 : -1
        return (a.timestamp - b.timestamp) * direction
      })

    response.send(new PaginatedResultSet(resultSet, null, null, null))
  }

  getIdentityNonce = async (request, response) => {
    const { identifier } = request.params

    const nonce = await this.sdk.identities.getIdentityNonce(identifier)

    response.send({ identityNonce: String(nonce) })
  }

  getIdentityContractNonce = async (request, response) => {
    const { identifier, data_contract_id: dataContractId } = request.params

    const nonce = await this.sdk.identities.getIdentityContractNonce(identifier, dataContractId)

    response.send({ identityContractNonce: String(nonce) })
  }

  getIdentitiesHistory = async (request, response) => {
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

    const timeSeries = await this.identitiesDAO.getIdentitiesHistorySeries(
      new Date(start),
      new Date(end),
      interval,
      isNaN(intervalInMs) ? Intervals[interval] : intervalInMs
    )

    response.send(timeSeries)
  }
}

module.exports = IdentitiesController
