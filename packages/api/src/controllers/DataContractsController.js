const DataContractsDAO = require('../dao/DataContractsDAO')

class DataContractsController {
  constructor (knex) {
    this.dataContractsDAO = new DataContractsDAO(knex)
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

    const dataContracts = await this.dataContractsDAO.getDataContracts(Number(page), Number(limit), order, orderBy)

    response.send(dataContracts)
  }
}

module.exports = DataContractsController
