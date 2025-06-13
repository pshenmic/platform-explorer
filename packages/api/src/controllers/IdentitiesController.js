const IdentitiesDAO = require('../dao/IdentitiesDAO')
const { WITHDRAWAL_CONTRACT_TYPE } = require('../constants')
const WithdrawalsContract = require('../../data_contracts/withdrawals.json')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const { outputScriptToAddress } = require('../utils')
const { Identifier } = require('@dashevo/wasm-dpp')
const { base58 } = require('@scure/base')

class IdentitiesController {
  constructor (client, knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex, dapi, client)
    this.dapi = dapi
    this.client = client
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
      type
    )

    response.send(transfers)
  }

  getWithdrawalsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { limit = 100, timestamp_start: timestampStart, start_at: startAt } = request.query

    const query = [['$ownerId', '=', Identifier.from(identifier)]]

    if (timestampStart) {
      query.push(['status', 'in', [0, 1, 2, 3, 4]], ['$createdAt', '>=', new Date(timestampStart).getTime()])
    }

    const documents = await this.dapi.getDocuments(
      WITHDRAWAL_CONTRACT_TYPE,
      WithdrawalsContract,
      query,
      limit,
      [['$ownerId', 'asc'], ['status', 'asc'], ['$createdAt', 'asc']],
      { startAt: startAt ? Buffer.from(base58.decode(startAt)) : undefined }
    )

    if (documents.length === 0) {
      return response.send(new PaginatedResultSet([], null, null, null))
    }

    const timestamps = documents.map(document => new Date(document.getCreatedAt()).toISOString())

    const withdrawals = await this.identitiesDAO.getIdentityWithdrawalsByTimestamps(identifier, timestamps)

    const resultSet = documents.map(document => ({
      document: document.getId(),
      sender: document.getOwnerId(),
      status: document.getData().status,
      timestamp: document.getCreatedAt(),
      amount: document.getData().amount,
      withdrawalAddress: outputScriptToAddress(Buffer.from(document.getData().outputScript ?? [], 'base64')),
      hash: withdrawals.find(
        withdrawal =>
          withdrawal.timestamp.getTime() === document.getCreatedAt().getTime()
      )?.hash
    }))

    response.send(new PaginatedResultSet(resultSet, null, null, null))
  }

  getIdentityNonce = async (request, response) => {
    const { identifier } = request.params

    const nonce = await this.dapi.getIdentityNonce(identifier)

    response.send({ identityNonce: String(nonce) })
  }

  getIdentityContractNonce = async (request, response) => {
    const { identifier, data_contract_id: dataContractId } = request.params

    const nonce = await this.dapi.getIdentityContractNonce(identifier, dataContractId)

    response.send({ identityContractNonce: String(nonce) })
  }
}

module.exports = IdentitiesController
