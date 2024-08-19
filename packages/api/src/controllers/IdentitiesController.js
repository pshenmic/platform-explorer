const IdentitiesDAO = require('../dao/IdentitiesDAO')
const DAPI = require('../dapi')

class IdentitiesController {
  constructor (knex) {
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.DAPI = new DAPI({
      dapiAddresses: [
        process.env.DAPI_URL
      ],
      retries: process.env.DAPI_RETRIES
    })
  }

  getIdentityByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    identity.balance = await this.DAPI.getIdentityBalance(identifier)

    response.send(identity)
  }

  getIdentityByDPNS = async (request, response) => {
    const { dpns } = request.query

    const identity = await this.identitiesDAO.getIdentityByDPNS(dpns)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    identity.balance = await this.DAPI.getIdentityBalance(identity.identifier)

    response.send(identity)
  }

  getIdentities = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height' } = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page), Number(limit), order, orderBy)

    // 130ms on local testnet node for 10 identities
    // 150ms on local testnet node for 20 identities
    // 175ms on local testnet node for 46 identities
    // maybe not bad, because not linear
    // but getIdentities was deprecated
    for (let i = 0; i < identities.resultSet.length; i++) {
      identities.resultSet[i].balance = await this.DAPI.getIdentityBalance(identities.resultSet[i].identifier)
    }

    response.send(identities)
  }

  getTransactionsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transactions = await this.identitiesDAO.getTransactionsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(transactions)
  }

  getDataContractsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const dataContracts = await this.identitiesDAO.getDataContractsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(dataContracts)
  }

  getDocumentsByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const documents = await this.identitiesDAO.getDocumentsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(documents)
  }

  getTransfersByIdentity = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transfers = await this.identitiesDAO.getTransfersByIdentity(identifier, Number(page), Number(limit), order)

    response.send(transfers)
  }
}

module.exports = IdentitiesController
