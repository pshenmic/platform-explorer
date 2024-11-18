const IdentitiesDAO = require('../dao/IdentitiesDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const { WITHDRAWAL_CONTRACT_TYPE } = require('../constants')
const WithdrawalsContract = require('../../data_contracts/withdrawals.json')

class IdentitiesController {
  constructor (knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex, dapi)
    this.dapi = dapi
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

    const identity = await this.identitiesDAO.getIdentityByDPNSName(dpns)

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
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const documents = await this.identitiesDAO.getDocumentsByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(documents)
  }

  getTransfersByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc', type = undefined } = request.query

    const transfers = await this.identitiesDAO.getTransfersByIdentity(identifier, Number(page ?? 1), Number(limit ?? 10), order, type)

    response.send(transfers)
  }

  getWithdrawalsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { limit = 100 } = request.query

    const documents = await this.dapi.getDocuments(WITHDRAWAL_CONTRACT_TYPE, WithdrawalsContract, identifier, limit)

    const timestamps = documents.map(document => new Date(document.timestamp).toISOString())

    const txHashes = await this.identitiesDAO.getIdentityWithdrawalsByTimestamps(identifier, timestamps)

    response.send(documents.map(document => ({
      ...document,
      hash: txHashes.find(
        hash =>
          new Date(hash.timestamp).toISOString() === new Date(document.timestamp).toISOString())?.hash ?? null
    })))
  }
}

module.exports = IdentitiesController
