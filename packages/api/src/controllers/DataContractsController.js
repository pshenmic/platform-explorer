const DataContractsDAO = require('../dao/DataContractsDAO')

class DataContractsController {
  constructor (knex, client, dapi) {
    this.dataContractsDAO = new DataContractsDAO(knex, client, dapi)
    this.dapi = dapi
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
    const { page = 1, limit = 10, order = 'asc', order_by: orderBy = 'block_height' } = request.query

    const dataContracts = await this.dataContractsDAO.getDataContracts(Number(page ?? 1), Number(limit ?? 10), order, orderBy)

    response.send(dataContracts)
  }

  getRawDataContract = async (request, response) => {
    const { identifier } = request.params

    let dataContract

    if (identifier) {
      dataContract = await this.dataContractsDAO.getDataContractByIdentifier(identifier)
    }

    if (!dataContract) {
      return response.status(404).send({ message: 'data contract not found' })
    }

    const buffer = (await this.dapi.dpp.dataContract.createFromObject({
      $format_version: '0',
      ownerId: dataContract.owner.identifier,
      id: dataContract.identifier,
      version: dataContract.version,
      documentSchemas: JSON.parse(dataContract.schema)
    })).toBuffer()

    response.send({ base64: buffer.toString('base64') })
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
}

module.exports = DataContractsController
