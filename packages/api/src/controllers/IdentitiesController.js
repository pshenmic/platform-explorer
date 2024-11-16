const IdentitiesDAO = require('../dao/IdentitiesDAO')
const DataContractsDAO = require('../dao/DataContractsDAO')
const { WITHDRAWAL_CONTRACT } = require('../constants')

class IdentitiesController {
  constructor (knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.dataContractsDAO = new DataContractsDAO(knex)
    this.dapi = dapi
  }

  getIdentityByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    const balance = await this.dapi.getIdentityBalance(identifier)

    response.send({ ...identity, balance })
  }

  getIdentityByDPNS = async (request, response) => {
    const { dpns } = request.query

    const identity = await this.identitiesDAO.getIdentityByDPNS(dpns)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    const balance = await this.dapi.getIdentityBalance(identity.identifier)

    response.send({ ...identity, balance })
  }

  getIdentities = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height' } = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page ?? 1), Number(limit ?? 10), order, orderBy)

    const identitiesWithBalance = await Promise.all(identities.resultSet.map(async identity => {
      const balance = await this.dapi.getIdentityBalance(identity.identifier)
      return { ...identity, balance }
    }))

    response.send({ ...identities, resultSet: identitiesWithBalance })
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

    const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(WITHDRAWAL_CONTRACT)

    if (!dataContract?.schema) {
      return response.status(404).send({ message: 'withdrawal contract not found' })
    }

    const documents = await this.dapi.getDocuments('withdrawal', dataContract, identifier, limit)

    const timestamps = documents.map(document => new Date(document.timestamp).toISOString())

    const documentsHashes = await this.identitiesDAO.getDocumentsTxHashesByIdentifiers(documents.map(document => document.id))

    if (documentsHashes.length > 0) {
      return response.send(documents.map(document => ({
        ...document,
        hash: documentsHashes.find(hash => document.hash === hash)
      })))
    }

    const hashes = await this.identitiesDAO.getIdentityWithdrawalsHashesTimestamp(identifier, timestamps)

    response.send(documents.map(document => ({
      ...document,
      hash: hashes.find(hash => hash.timestamp === new Date(document.timestamp).toISOString())
    })))
  }
}

module.exports = IdentitiesController
