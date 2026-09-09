const PlatformAddressesDAO = require('../dao/PlatformAddressesDAO')
const StateTransitionEnum = require('../enums/StateTransitionEnum')

module.exports = class PlatformAddressesController {
  constructor (knex, sdk) {
    this.platformAddressesDAO = new PlatformAddressesDAO(knex, sdk)
  }

  getPlatformAddressInfo = async (request, response) => {
    const { platform_address: platformAddress } = request.params

    const platformAddressInfo = await this.platformAddressesDAO.getPlatformAddressInfo(platformAddress)

    if (!platformAddressInfo) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(platformAddressInfo)
  }

  getPlatformAddresses = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc'
    } = request.query

    const platformAddresses = await this.platformAddressesDAO.getPlatformAddresses(Number(page ?? 0), Number(limit ?? 0), order)

    response.send(platformAddresses)
  }

  getPlatformAddressTransition = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      transaction_type: transactionTypes
    } = request.query

    const normalizedTransactionTypes = transactionTypes?.map(transactionType => typeof transactionType === 'string' ? StateTransitionEnum[transactionType] : transactionType)

    const { platform_address: platformAddress } = request.params

    const transitions = await this.platformAddressesDAO.getPlatformAddressTransitions([platformAddress], Number(page ?? 0), Number(limit ?? 0), order, normalizedTransactionTypes)

    response.send(transitions)
  }

  getPlatformAddressesInfo = async (request, response) => {
    const { addresses } = request.body

    const platformAddresses = await this.platformAddressesDAO.getPlatformAddressesInfo(addresses)

    response.send(platformAddresses)
  }

  getPlatformAddressesTransitions = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      transaction_type: transactionTypes
    } = request.query

    const normalizedTransactionTypes = transactionTypes?.map(transactionType => typeof transactionType === 'string' ? StateTransitionEnum[transactionType] : transactionType)

    const { addresses } = request.body

    const transitions = await this.platformAddressesDAO.getPlatformAddressTransitions(addresses, Number(page ?? 0), Number(limit ?? 0), order, normalizedTransactionTypes)

    response.send(transitions)
  }
}
