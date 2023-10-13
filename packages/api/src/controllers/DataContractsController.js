const DataContract = require("../models/DataContract");
const DataContractsDAO = require("../dao/DataContractsDAO");

class DataContractsController {
    constructor(knex) {
        this.dataContractsDAO = new DataContractsDAO(knex)
    }

    getDataContracts = async (request, response) => {
        const {page = 1, limit = 10, order = 'asc'} = request.query

        if (order !== 'asc' && order !== 'desc') {
            return response.status(400).send({message: `invalid ordering value ${order}. only 'asc' or 'desc' is valid values`})
        }

        const dataContracts = await this.dataContractsDAO.getDataContracts(Number(page), Number(limit), order);

        response.send(dataContracts)
    }

    getDataContractByIdentifier = async (request, response) => {
        const {identifier} = request.params

        const dataContract = await this.dataContractsDAO.getDataContractByIdentifier(identifier)

        if (!dataContract) {
            response.status(404).send({message: 'not found'})
        }

        response.send(dataContract);
    }
}

module.exports = DataContractsController
