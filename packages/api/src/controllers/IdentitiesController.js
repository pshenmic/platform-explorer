const IdentitiesDAO = require('../dao/IdentitiesDAO')
const Identity = require('../models/Identity')
const PaginatedResultSet = require("../models/PaginatedResultSet");
const Transaction = require("../models/Transaction");

class IdentitiesController {
  constructor(knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.dapi = dapi
  }

  getIdentityByIdentifier = async (request, response) => {
    const {identifier} = request.params

    const identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    const balance = await this.dapi.getIdentityBalance(identifier)

    response.send({...identity, balance})
  }

  getIdentityByDPNS = async (request, response) => {
    const {dpns} = request.query

    const identity = await this.identitiesDAO.getIdentityByDPNS(dpns)

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    const balance = await this.dapi.getIdentityBalance(identity.identifier)

    response.send({...identity, balance})
  }

  getIdentities = async (request, response) => {
    const {page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height'} = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page), Number(limit), order, orderBy)

    const identitiesWithBalance = await Promise.all(identities.resultSet.map(async identity => {
      const balance = await this.dapi.getIdentityBalance(identity.identifier)
      return {...identity, balance}
    }))


    response.send({...identities, resultSet: identitiesWithBalance})
  }

  getTransactionsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const transactions = await this.identitiesDAO.getTransactionsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(transactions)
  }

  getDataContractsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const dataContracts = await this.identitiesDAO.getDataContractsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(dataContracts)
  }

  getDocumentsByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const documents = await this.identitiesDAO.getDocumentsByIdentity(identifier, Number(page), Number(limit), order)

    response.send(documents)
  }

  getTransfersByIdentity = async (request, response) => {
    const {identifier} = request.params
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const transfers = await this.identitiesDAO.getTransfersByIdentity(identifier, Number(page), Number(limit), order)

    response.send(transfers)
  }
}

module.exports = IdentitiesController
