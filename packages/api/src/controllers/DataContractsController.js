const DataContractsDAO = require('../dao/DataContractsDAO')

class DataContractsController {
  constructor (knex, client, dapi) {
    this.dataContractsDAO = new DataContractsDAO(knex, client, dapi)
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

  getDataContractTransactions = async (request, response) => {
    const {identifier} = request.params
    const { page = 1, limit = 10, order = 'asc' } = request.query

    const transactions = await this.dataContractsDAO.getDataContractTransactions(identifier, Number(page ?? 1), Number(limit ?? 10), order)

    response.send(transactions)
  }
}

module.exports = DataContractsController
