const DataContractsDAO = require('../dao/DataContractsDAO')

class DataContractsController {
  constructor (knex, sdk) {
    this.dataContractsDAO = new DataContractsDAO(knex, sdk)
    this.sdk = sdk
  }

  getDataContractByIdentifier = async (request, response) => {
    const { identifier } = request.params

    const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(identifier)

    if (!dataContract) {
      response.status(404).send({ message: 'not found' })
    }

    response.send(dataContract)
  }

  getDataContracts = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      order_by: orderBy = 'block_height',
      owner,
      is_system: isSystem,
      with_tokens: withTokens,
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd,
      // tx_count_min: txCountMin,
      // tx_count_max: txCountMax,
      documents_count_min: documentsCountMin,
      documents_count_max: documentsCountMax
    } = request.query

    if (!['block_height', 'documents_count', 'tx_count', 'balance'].includes(orderBy)) {
      return response.status(400).send({ message: 'invalid filters values' })
    }

    if (!timestampStart !== !timestampEnd) {
      return response.status(400).send({ message: 'you must use timestamp_start and timestamp_end' })
    }

    const dataContracts = await this.dataContractsDAO.getDataContracts(
      Number(page ?? 1),
      Number(limit ?? 10),
      order,
      orderBy,
      owner,
      isSystem,
      withTokens,
      timestampStart,
      timestampEnd,
      documentsCountMin,
      documentsCountMax
    )

    response.send(dataContracts)
  }

  getRawDataContract = async (request, response) => {
    const { identifier } = request.params

    let dataContract

    if (identifier) {
      dataContract = await this.sdk.dataContracts.getDataContractByIdentifier(identifier)
    }

    if (!dataContract) {
      return response.status(404).send({ message: 'data contract not found' })
    }

    response.send({ base64: dataContract.base64() })
  }

  getDataContractTransactions = async (request, response) => {
    const { identifier } = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transactions = await this.dataContractsDAO.getDataContractTransactions(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    if (!transactions) {
      return response.status(404).send({ message: 'not found' })
    }

    response.send(transactions)
  }

  getDataContractTrends = async (request, response) => {
    const {
      page = 1,
      limit = 10,
      order = 'asc',
      timestamp_start: start = new Date().getTime() - 2592000000,
      timestamp_end: end = new Date().getTime()
    } = request.query

    if (!start || !end) {
      return response.status(400).send({ message: 'start and end must be set' })
    }

    if (start > end) {
      return response.status(400).send({ message: 'start timestamp cannot be more than end timestamp' })
    }

    const trends = await this.dataContractsDAO.getContractsTrends(new Date(start), new Date(end), page, limit, order)

    response.send(trends)
  }
}

module.exports = DataContractsController
