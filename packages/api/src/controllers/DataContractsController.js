const DataContract = require("../models/DataContract");
const DataContractsDAO = require("../dao/DataContractsDAO");

class DataContractsController {
    constructor(knex) {
        this.dataContractsDAO = new DataContractsDAO(knex)
    }

    getDataContracts = async (request, response) => {
        const dataContracts = await this.dataContractsDAO.getDataContracts();

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
