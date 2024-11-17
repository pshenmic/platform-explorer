const IdentitiesDAO = require('../dao/IdentitiesDAO')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../enums/StateTransitionEnum')
const { validateAliases } = require('../utils')
const { base58 } = require('@scure/base')

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

    let preIdentity
    let identity

    if (!dpns.includes('.')) {
      preIdentity = await this.identitiesDAO.getIdentityByDPNS(dpns)

      if (!preIdentity) {
        return response.status(404).send({ message: 'not found' })
      }
    }

    const [{ contestedState }] = await validateAliases(
      [preIdentity ? preIdentity.aliases.find(v => v.includes(`${dpns}.`)) : dpns],
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
      identity = preIdentity ?? await this.identitiesDAO.getIdentityByDPNS(dpns)
    }

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
    const { page = 1, limit = 10, order = 'asc' } = request.query

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
