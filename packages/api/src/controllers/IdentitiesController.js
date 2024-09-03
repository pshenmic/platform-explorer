const IdentitiesDAO = require('../dao/IdentitiesDAO')
const Identity = require('../models/Identity')

class IdentitiesController {
  constructor (knex, DAPI) {
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.DAPI = DAPI
  }

  getIdentityByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    const balance = await this.DAPI.getIdentityBalance(identifier)

    response.send(Identity.fromObject({ ...identity, balance }))
  }

  getIdentityByDPNS = async (request, response) => {
    const { dpns } = request.query

    const identity = await this.identitiesDAO.getIdentityByDPNS(dpns)

    if (!identity) {
      return response.status(404).send({ message: 'not found' })
    }

    const balance = await this.DAPI.getIdentityBalance(identity.identifier)

    response.send(Identity.fromObject({ ...identity, balance }))
  }

  getIdentities = async (request, response) => {
    const { page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height' } = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page), Number(limit), order, orderBy)

    for (let i = 0; i < identities.resultSet.length; i++) {
      const balance = await this.DAPI.getIdentityBalance(identities.resultSet[i].identifier)

      identities.resultSet[i] = Identity.fromObject({ ...identities.resultSet[i], balance })
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
