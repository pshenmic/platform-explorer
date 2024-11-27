const IdentitiesDAO = require('../dao/IdentitiesDAO')
const {WITHDRAWAL_CONTRACT_TYPE} = require('../constants')
const WithdrawalsContract = require('../../data_contracts/withdrawals.json')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const {decodeStateTransition} = require('../utils')

class IdentitiesController {
  constructor(client, knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex, dapi)
    this.dapi = dapi
    this.client = client
  }

  getIdentityByIdentifier = async (request, response) => {
    const {identifier} = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    response.send(identity)
  }

  getIdentityByDPNSName = async (request, response) => {
    const {dpns} = request.query

    const identity = await this.identitiesDAO.getIdentityByDPNSName(dpns)

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    response.send(identity)
  }

  getIdentities = async (request, response) => {
    const {page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height'} = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page ?? 1), Number(limit ?? 10), order, orderBy)

    response.send(identities)
  }

  getTransactionsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const transactions = await this.identitiesDAO.getTransactionsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(transactions)
  }

  getDataContractsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const dataContracts = await this.identitiesDAO.getDataContractsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(dataContracts)
  }

  getDocumentsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const documents = await this.identitiesDAO.getDocumentsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getTransfersByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc', type = undefined} = request.query

    const transfers = await this.identitiesDAO.getTransfersByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order, type)

    response.send(transfers)
  }

  getWithdrawalsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {limit = 100} = request.query

    const documents = await this.dapi.getDocuments(WITHDRAWAL_CONTRACT_TYPE, WithdrawalsContract, identifier, limit)

    if (documents.length === 0) {
      return response.status(404).send({message: 'not found'})
    }

    const timestamps = documents.map(document => new Date(document.timestamp).toISOString())

    const txHashes = await this.identitiesDAO.getIdentityWithdrawalsByTimestamps(identifier, timestamps)

    const decodedTx = await Promise.all(txHashes.map(async tx => ({
      ...await decodeStateTransition(this.client, tx.data),
      timestamp: tx.timestamp
    })))

    const resultSet = documents.map(document => ({
      document: document.id ?? null,
      sender: document.sender ?? null,
      status: document.status ?? null,
      timestamp: document.timestamp ?? null,
      amount: document.amount ?? null,

      withdrawalAddress:
        decodedTx.find(
          tx=>tx.timestamp.getTime() === document.timestamp
        )?.outputAddress ?? null,

      hash: txHashes.find(
        hash =>
          new Date(hash.timestamp).toISOString() === new Date(document.timestamp).toISOString())?.hash ?? null
    }))

    response.send(new PaginatedResultSet(resultSet, null, null, null))
  }
}

module.exports = IdentitiesController
