const IdentitiesDAO = require('../dao/IdentitiesDAO')
const { WITHDRAWAL_CONTRACT_TYPE, WITHDRAWAL_CONTRACT } = require('../constants')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { outputScriptToAddress } = require('../utils')
const { IdentifierWASM } = require('pshenmic-dpp')
const StateTransitionEnum = require('../enums/StateTransitionEnum')

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
    const { page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height' } = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page ?? 1), Number(limit ?? 10), order, orderBy)

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
    const { limit = 100, timestamp_start: timestampStart, start_at: startAt } = request.query

    const query = [['$ownerId', '=', new IdentifierWASM(identifier).base58()]]

    if (timestampStart) {
      query.push(['status', 'in', [0, 1, 2, 3, 4]], ['$createdAt', '>=', new Date(timestampStart).getTime()])
    }

    const documents = await this.sdk.documents.query(
      WITHDRAWAL_CONTRACT,
      WITHDRAWAL_CONTRACT_TYPE,
      query,
      [['$ownerId', 'asc'], ['status', 'asc'], ['$createdAt', 'asc']],
      limit,
      startAt
    )

    if (documents.length === 0) {
      return response.send(new PaginatedResultSet([], null, null, null))
    }

    const timestamps = documents.map(document => new Date(Number(document.createdAt)).toISOString())

    const withdrawals = await this.identitiesDAO.getIdentityWithdrawalsByTimestamps(identifier, timestamps)

    const resultSet = documents.map(document => ({
      document: document.id.base58(),
      sender: document.ownerId.base58(),
      status: document.properties.status,
      timestamp: new Date(Number(document.createdAt)),
      amount: document.properties.amount,
      withdrawalAddress: outputScriptToAddress(Buffer.from(document.properties.outputScript ?? [], 'base64')),
      hash: withdrawals.find(
        withdrawal =>
          withdrawal.timestamp.getTime() === Number(document.createdAt)
      )?.hash
    }))

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
}

module.exports = IdentitiesController
