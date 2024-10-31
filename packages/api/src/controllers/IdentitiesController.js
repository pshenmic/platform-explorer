const IdentitiesDAO = require('../dao/IdentitiesDAO')
const {IDENTITY_CREDIT_WITHDRAWAL} = require('../enums/StateTransitionEnum')
const {generateNormalizedLabelBuffer, getLabelBuffer, validateAliases} = require("../utils");
const Identity = require("../models/Identity");
const {base58} = require("@scure/base");

class IdentitiesController {
  constructor(knex, dapi) {
    this.identitiesDAO = new IdentitiesDAO(knex)
    this.dapi = dapi
  }

  getIdentityByIdentifier = async (request, response) => {
    const {identifier} = request.params
    let [identity] = await Promise.all([this.identitiesDAO.getIdentityByIdentifier(identifier)])

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    const validatedAliases = await validateAliases(identity.aliases, identity.identifier, this.dapi)

    identity = Identity.fromObject({...identity, aliases: validatedAliases})

    const balance = await this.dapi.getIdentityBalance(identifier)

    response.send({...identity, balance})
  }


  getIdentityByDPNS = async (request, response) => {
    const {dpns} = request.query

    let preIdentity
    let identity

    let contestedState

    if (!dpns.includes('.')) {
      preIdentity = await this.identitiesDAO.getIdentityByDPNS(dpns)

      if (!preIdentity) {
        return response.status(404).send({message: 'not found'})
      }
    }

    [{contestedState}] = await validateAliases(
      [preIdentity ? preIdentity.aliases.find(v => v.includes(dpns)) : dpns],
      null,
      this.dapi
    )

    if (contestedState) {
      if (typeof contestedState.finishedVoteInfo?.wonByIdentityId === 'string') {
        const identifier = base58.encode(Buffer.from(contestedState.finishedVoteInfo?.wonByIdentityId, 'base64'))

        identity = await this.identitiesDAO.getIdentityByIdentifier(identifier)
      }
    }

    if (!contestedState) {
      identity = preIdentity
    }

    if (!identity) {
      return response.status(404).send({message: 'not found'})
    }

    const balance = await this.dapi.getIdentityBalance(identity.identifier)

    const validatedAliases = await validateAliases(identity.aliases, identity.identifier, this.dapi)

    identity = Identity.fromObject({...identity, aliases: validatedAliases})

    response.send({...identity, balance})
  }

  getIdentities = async (request, response) => {
    const {page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height'} = request.query

    const identities = await this.identitiesDAO.getIdentities(Number(page ?? 1), Number(limit ?? 10), order, orderBy)

    const identitiesWithBalance = await Promise.all(identities.resultSet.map(async identity => {
      const balance = await this.dapi.getIdentityBalance(identity.identifier)

      const validatedAliases = await validateAliases(identity.aliases, identity.identifier, this.dapi)

      return {...identity, aliases: validatedAliases, balance}
    }))

    response.send({...identities, resultSet: identitiesWithBalance})
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
    const {page = 1, limit = 10, order = 'asc'} = request.query

    const withdrawals = await this.identitiesDAO.getTransfersByIdentity(
      identifier,
      Number(page ?? 1),
      Number(limit ?? 10),
      order ?? 'asc',
      IDENTITY_CREDIT_WITHDRAWAL
    )

    response.send(withdrawals)
  }
}

module.exports = IdentitiesController
